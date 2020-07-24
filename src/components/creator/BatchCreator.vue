<template>
    <div class="batch-creator">
        <template v-for="f in foreignKeys">
            <batch-creator :structure="f" :value="getForeignKeyData(f)"
                           :appModelName="f.name" @optionLoaded="onForeignKeyLoaded"
                           :ref="f.name.split('.')[1]" @exists="onForeignkeyExists"></batch-creator>

        </template>
        <template v-if="records.length>0">
            <el-budge :value="records.length"><h4>{{structure.label}} {{records.length}}</h4></el-budge>
            <data-table :value="records" :fields="structure.tableItems" :cellWidget="TooltipCell"
                        :topActions="[{name:'create',label:'批量创建',icon:'bolt',do:saveRecords}]"
                        :options="{elTable:{maxHeight:400}}" ref="table"></data-table>
        </template>
    </div>
</template>
<script>
    import DataTable from '../table/DataTable.vue'
    import TooltipCell from '../table/widgets/TooltipCell.vue'
    import {pick, last, uniqWith, isEqual, isEmpty, uniqueId, filter, forOwn, sortBy} from 'lodash'
    import ModelView from '../../mixins/model_view'
    import ServerResponse from '../../mixins/server_response'
    import Qs from 'qs'
    import queueLimit from '../../utils/async_queue'
    import {Validator, genFieldRules, clear$Fields} from '../../utils/validators'
    import {Register} from '../../utils/app_model'

    export default{
        name: 'BatchCreator',
        mixins: [ServerResponse, ModelView],
        props: {
            structure: Object,
            value: Array
        },
        data () {
            return {
                activeList: [],
                records: [],
                loaded: false,
                fieldConfigs:{},
                TooltipCell
            }
        },
        components: {DataTable},
        created(){
            this.modelInit()
            this.modelLoadOptions().then(() => {
                this.structure.label = this.modelConfig.verbose_name
                if (!this.structure.rel) {
                    this.structure.rel = last(this.structure.name.split('.'))
                }
                this.fieldConfigs =  {...this.modelFieldConfigs}
                let coms = this.structure.composites
                if (coms) {
                    return queueLimit(coms,1, (com) => {
                        return Register.get(com).loadOptions().then(data => {
                            com.fieldConfigs = data.actions.POST
                        })
                    })
                }
                return Promise.resolve()
            }).then(() => {

                this.loaded = true
                this.checkStatus()
            })
        },
        methods: {
            rowClassName({row, rowIndex}){
                return row.id > 0 ? 'table__record-exists' : ''
            },
            onForeignKeyLoaded(context){
                let st = context.structure
                Object.assign(this.structure.foreignKeys.find(fk => fk.name === st.name), st)
                this.activeList.push(st)
                this.checkStatus()

            },
            onForeignkeyExists({data, structure}){
                let rel = structure.rel
                let id = data.id
                let d = pick(data, structure.fieldNames)
                forOwn(d, (v, k) => {
                    d[`${rel}.${k}`] = d[k]
                    delete d[k]
                })
                let fks = filter(this.value, d)
                fks.forEach(v => {
                    v[rel] = id
                    this.checkExists(v)
                })
//                console.log([`onForeignKeysExists ${rel}`, data, d, fks])
            },
            checkStatus() {
                if (this.activeList.length === this.foreignKeys.length && this.loaded) {
                    this.structure = Object.assign({insertMode: 'ignore'}, this.structure, {
                        tableItems: this.tableItems,
                        fieldNames: this.fieldNames,
                        count: this.activeList.map(a => a.count).reduce((a, b) => a + b, this.plainFields.length)
                    })
//                    console.log(this.structure)
                    this.$emit('optionLoaded', {structure: this.structure})
                }
//                console.log([this.activeList.length, this.foreignKeys.length, this.loaded])
            },
            checkExists(d){
                let uns = this.modelOptions.unique_together
                uns = uns && uns[0]
                let fks = this.foreignKeys
                fks = uns ? fks.filter(fk => uns.includes(fk.rel)) : fks
                let b = fks.every(fk => d[fk.rel] > 0)
                if (!b) {
                    d.id = null
//                    console.log([d.teacher, d.clazz, d.course])
                    return Promise.resolve()
                }
                let ls = this.structure.lookups
                let qs = pick(d, this.fieldNames)
                if (ls) {
                    forOwn(ls, (v, k) => {
                        qs[`${k}__${v}`] = qs[k]
                        delete qs[k]
                    })
                }

                if (uns) {
                    qs = pick(qs, uns)
                }
                return this.$http.get(`${this.modelListUrl}?${Qs.stringify(qs)}`).then(({data}) => {
                    if (data.count === 1) {
                        d.id = data.results[0].id
                        this.$emit('exists', {data: d, structure: this.structure})
                    } else {
                        d.id = null
                    }
                })
            },
            checkExistsRecur(){
                if (this.insertMode === 'append') {
                    return Promise.resolve()
                }
                return queueLimit(this.activeList, 1, (fk) => {
                    let rel = fk.name.split('.')[1]
                    let com = this.$refs[rel][0]
                    return com.checkExistsRecur()
                }).then(() => {
                    return queueLimit(this.value, 3, (d) => {
                        return this.checkExists(d)
                    })
                }).then(() => {
                    this.getRecords()
                    return Promise.resolve(this.records)
                })
            },
            saveRecords() {
                return queueLimit(this.activeList, 1, (fk) => {
                    let rel = fk.name.split('.')[1]
                    let com = this.$refs[rel][0]
                    return com.saveRecords()
                }).then(() => {
                    return queueLimit(this.records, 1, (d => {
                        if (this.insertMode === 'append' || !d.id) {
                            if (d.$errors) {
                                return Promise.resolve()
                            }
                            return this.$http.post(this.modelListUrl, d).then(({data}) => {
                                Object.assign(d, data)
                                this.$emit('exists', {data: d, structure: this.structure})
                            }).catch(e => {
                                this.onServerResponseError(e)
                                if (e.code === '400') {
                                    d.$errors = e.msg
                                }
                            })
                        } else {
                            return this.$http.put(this.modelGetDetailUrl(d.id), d).then(({data}) => {
                                Object.assign(d, data)
                            })
                        }
                    }))
                }).then(() => {
                    this.getRecords()
                })
            },
            saveComposite(){
               this.structure.composites.forEach(com => {

               })
            },
            getRecords(){
                let func = this.insertMode === 'ignore' ? (d => !d.id) : (d => true)
                this.records = this.sortByErrors(uniqWith(this.value.filter(func), isEqual))
            },
            normalizeStructure(){
                let r = Object.assign({}, this.structure)
                r.insertMode = r.insertMode || 'ignore'
                if (s.foreignKeys) {
                    s.foreignKeys.forEach(fk => {
                        let st = this.getStructure(fk)
                        r.count += st.count
                        r.foreignKeys.push(st)
                    })
                }
                r.count += s.plainFields.length
                if (!r.rel) {
                    r.rel = last(s.name.split('.'))
                }
                return r
            },
            sortByErrors(ds){
                return sortBy(ds, a => a.$errors && Object.keys(a.$errors))
            },
            getForeignKeyData(f){
                if (!f.tableItems) {
                    return []
                }
                let fcs = this.fieldConfigs
                let fns = []
                let pairs = []
                f.tableItems.forEach(ti => {
                    let ofn = `${f.rel}.${ti.name}`
                    fns.push(ofn)
                    pairs.push([ofn, ti.name])
                })
                fns.push(f.rel)
                pairs.push([f.rel, 'id'])
                let data = this.value.map(a => {
                    let d = pick(a, fns)
                    let $errors = {}
                    let $es = a.$errors || {}
                    pairs.forEach(p => {
                        d[p[1]] = d[p[0]]
                        let $e = $es[p[0]]
                        if ($e) {
                            $errors[p[1]] = $e
                        }
                        delete d[p[0]]
                    })
//                    console.log([a.$errors,$errors])
                    if (Object.keys($errors).length > 0) {
                        d.$errors = $errors
                    }
                    return d
                })
                data = uniqWith(data, isEqual)
                let required = fcs[f.rel].required
                data = data.filter(a => !Object.values(clear$Fields(a)).every(isEmpty))
                return data
            }
        },
        computed: {
            insertMode () {
                return this.structure.insertMode
            },
            plainFields(){
                return this.structure.plainFields || []
            },
            foreignKeys() {
                return this.structure.foreignKeys || []
            },
            fieldNames () {
                return this.plainFields.concat(this.foreignKeys.map(fk => fk.rel))
            },
            tableItems(){
                let r = []
                let fcs = this.fieldConfigs
                if (isEmpty(fcs)) {
                    return r
                }
                let vs = this.structure.validator || {}
                let pfs = this.plainFields && this.plainFields.map(pf => {
                        let rules = genFieldRules(fcs[pf])
                        let vld = vs[pf]
                        let format = undefined
                        let synonyms=undefined
                        if (vld) {
                            rules.push(vld)
                            format = vld.format
                            synonyms = vld.synonyms
                        }
                        return {...fcs[pf], name:pf, rules, format, synonyms}
                    })
                this.activeList.forEach(fk => {
                    let required = fcs[fk.rel].required
                    fk.tableItems.forEach(ti => {
                        let label = fk.count > 1 ? `${fk.label}.${ti.label}` : `${fk.label}`
                        let synonyms = fk.count > 1 ? [] : fk.synonyms
                        let nti = {...ti, name: `${fk.rel}.${ti.name}`, label, synonyms}
                        if (!required && fk.count === 1) {
                            nti.rules.forEach(r => {
                                if (r.required) {
                                    r.required = false
                                }
                            })
                        }
                        r.push(nti)
                    })
                })
                r = r.concat(pfs)
//                console.log(r)
                return r
            }
        },
        watch: {
            value(v){
//                let vconfig = this.structure.validator
//                console.log([this.structure.name, vconfig])
//                if (vconfig) {
//                    let vld = Validator(vconfig)
//                    v.forEach(d => {
//                        vld.validate(d)
//                    })
//                }
            }
        }
    }
</script>
<style>
    .batch-creator .table__record-exists {
        background-color: lightyellow;
    }
</style>
