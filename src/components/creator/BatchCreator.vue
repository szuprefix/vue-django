<template>
    <div>
        <template v-for="f in foreignKeys">
            <batch-creator :structure="f" :value="getForeignKeyData(f)"
                           :appModelName="f.name" @optionLoaded="onForeignKeyLoaded"></batch-creator>

        </template>

        <h4>{{structure.label}}</h4>
        <data-table :value="value" :fields="structure.tableItems" v-if="structure.tableItems && value && value.length>0" :topActions="[]" :options="{elTable:{maxHeight:400}}"></data-table>
    </div>
</template>
<script>
    import DataTable from '../table/DataTable.vue'
    import {pick, last, uniqWith, isEqual} from 'lodash'
    import ModelView from '../../mixins/model_view'
    export default{
        name: 'BatchCreator',
        mixins: [ModelView],
        props: {
            structure: Object,
            value: Array
        },
        data () {
            return {
                activeList: [],
                loaded: false
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
                this.loaded = true
                this.checkStatus()
            })
//            console.log(this.plainFieldData)
        },
        methods: {
            onForeignKeyLoaded(context){
                let st = context.structure
                Object.assign(this.structure.foreignKeys.find(fk => fk.name === st.name ), st)
                this.activeList.push(st)
                this.checkStatus()

            },
            checkStatus() {
                if(this.activeList.length=== this.foreignKeys.length && this.loaded){
                    this.structure = Object.assign({}, this.structure, {
                        tableItems:this.tableItems,
                        count: this.activeList.map(a => a.count).reduce((a,b) => a+b, this.plainFields.length)
                    })
//                    console.log(this.structure)
                    this.$emit('optionLoaded', {structure: this.structure})
                }
//                console.log([this.activeList.length, this.foreignKeys.length, this.loaded])
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
            getForeignKeyData(f){
//                console.log(f)
                if(!f.tableItems){
                    return []
                }
                let fns = []
                let pairs = []
                f.tableItems.forEach(ti => {
                    let ofn = `${f.rel}.${ti.name}`
                    fns.push(ofn)
                    pairs.push([ofn, ti.name])
                })
                let data = this.value.map(a =>pick(a, fns))
                data.forEach(d => {
                    pairs.forEach(p => {
                        d[p[1]] = d[p[0]]
                        delete d[p[0]]
                    })
                })
                console.log([pairs, fns, f])
                return uniqWith(data, isEqual)
            }
        },
        computed: {
            plainFields(){
                return this.structure.plainFields || []
            },
            foreignKeys() {
                return this.structure.foreignKeys || []
            },
            tableItems(){
                let r = []
                let fcs = this.modelFieldConfigs
                let pfs = this.plainFields && this.plainFields.map(pf => fcs[pf])
                let fks = this.foreignKeys && this.foreignKeys.map(fk => fcs[fk])
                this.activeList.forEach(fk => {
                    fk.tableItems.forEach(ti => {
                        let label = fk.count>1 ?`${fk.label}.${ti.label}`:`${fk.label}`
                        let synonyms = fk.count>1 ? []: fk.synonyms
                        let nti = Object.assign({}, ti, {name:`${fk.rel}.${ti.name}`, label, synonyms})
//                        console.log(nti)
                        r.push(nti)
                    })
                })
                r=r.concat(pfs)
                return r
            },
            plainFieldData(){
                return this.value.map(a => pick(a, this.plainFields))
            }
        }
    }
</script>
<style scoped></style>
