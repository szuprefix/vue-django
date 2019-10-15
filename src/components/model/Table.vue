<template>
    <div>
        <search v-model="search" :options="searchOptions" :model="model" :exclude="_baseQueries" ref="search"
                @change="onSearch"></search>
        <batch-actions :items="batchActionItems" :count="selection.length" @done="refresh" :context="{selection}"
                       v-if="batchActionItems.length>0"></batch-actions>
        <el-drawer :visible.sync="editing" direction="rtl"
                   :title="`${parentMultipleRelationField?'添加':'创建'}${model.config.verbose_name}`" size="66%">
            <slot name="edit">
                <model-table :appModel="appModel" :options="{remoteTable:{table:{topActions:[], rowActions:[]}}}"
                             :batchActions="[{name:'add', label:`添加到${parent.title()}`, type:'primary', confirm:false, do:addToParent}]"
                             v-if="parentMultipleRelationField"></model-table>
                <component :is="creator" :appModel="appModel" :defaults="parentQueries" v-else
                           :topActions="['saveAndAnother']"></component>

            </slot>
        </el-drawer>

        <remote-table :items="tableItems" :url="model.getListUrl()" ref="table" @loaded="onLoaded" v-if="optionLoaded"
                      :baseQueries="_baseQueries"
                      :options="rtOptions"></remote-table>
    </div>
</template>
<script>
    import RemoteTable from '../table/RemoteTable.vue'
    import Model from './Model'
    import {mergeOptions} from '../table/Table'
    import array_normalize from '../../utils/array_normalize'
    import server_response from '../../mixins/server_response'
    import Qs from 'qs'
    import BatchActions from '../layout/BatchActions.vue'

    import TrueFlag from '../widgets/TrueFlag.vue'
    import ChoicesDisplay from '../widgets/ChoicesDisplay.vue'
    import Date2Now from '../widgets/Date2Now.vue'
    import ForeignKey from '../widgets/ForeignKey.vue'
    import Search from './Search.vue'

    export default{
        name: 'ModelTable',
        mixins: [server_response],
        props: {
            appModel: String,
            items: Array,
            baseQueries: {
                type: Object, default: () => {
                    return {}
                }
            },
            parent: Object,
            options: {
                type: Object,
                default: () => {
                    return {}
                }
            },
            batchActions: Array
        },
        data () {
            return {
                model: Model(this.appModel, {}, this.$store.state.bus),
                tableItems: [],
                search: {},
                optionLoaded: false,
                creator: undefined,
                editing: false,
                batchActionItems: [],
                selection: [],
                parentQueries: {},
                avairableActions: {
                    'create': {
                        icon: 'plus',
                        title: '创建',
                        do: this.toCreateModel,
                        show: () => this.checkPermission('add')
                    },
                    'add': {
                        icon: 'plus-square',
                        label: '添加',
                        do: this.addToParent,
                        show: () => this.parent.checkPermission('add', this.$store.state.user.permissions)
                    },
                    'edit': {
                        icon: 'pencil',
                        title: '编辑',
                        do: this.toEditModel,
                        show: () => this.checkPermission('change')
                    },
                    'delete': {
                        icon: 'trash',
                        title: '删除',
                        do: this.toDeleteModel,
                        show: () => this.checkPermission('delete')
                    },
                    'removeFromParent': {
                        icon: 'trash',
                        title: '移除',
                        do: this.removeFromParent,
                        show: () => this.parent.checkPermission('add', this.$store.state.user.permissions)
                    },
                    'batch': {
                        icon: 'archive',
                        title: '批量创建',
                        do: this.toBatchCreateModel,
                        show: () => this.checkPermission('add')
                    }
                }
            }
        },
        components: {RemoteTable, Search, BatchActions},
        mounted () {
            this.init()
            this.$store.state.bus.$on('model-posted', this.onModelPosted)
            this.$store.state.bus.$on('model-deleted', this.onModelPosted)
        },
        beforeDestroy () {
            this.$store.state.bus.$off('model-posted', this.onModelPosted)
            this.$store.state.bus.$off('model-deleted', this.onModelPosted)
        },
        methods: {
            init () {
                this.model.loadOptions().then((data) => {
                    let search = this.model.options.actions.SEARCH
                    this.$refs.search.init()
                    this.orderingFields = search.ordering_fields
                    return this.normalizeItems()
                }).then(() => {
                    this.parentQueries = Object.assign({}, this.getParentQueries())
                    this.optionLoaded = true
//                    this.$refs.table.updateQueries({})
                }).catch(this.onServerResponseError)
            },
            refresh () {
                this.$refs.table.refresh()
            },
            onLoaded (v) {
                this.$emit('loaded', v)
            },
            onSearch () {
                this.$refs.table.updateQueries({...this.search, page: 1})
            },
            onModelPosted ({appModel, id}) {
                let dps = this.model.options.dependencies
                if (appModel === this.appModel || dps && dps.includes(appModel)) {
                    this.$refs.table.load()
                }
            },
            onRowSelect (row, column, cell, event) {
                if (this.onDBClick) {
                    this.onDBClick(row, column, cell, event)
                } else if (this.rowActions.includes('edit') && this.modelCheckPermission('change')) {
                    this.toEditModel({row, column, cell, event})
                }
            },

            toEditModel ({row}){
                this.$router.push(this.model.getDetailUrl(row.id))
            },

            toDeleteModel ({row}){
                return this.$confirm(`确定要删除${row.__str__}吗?`, {type: 'warning'}).then(() => {
                    return this.model.destroy(row.id)
                }).catch(this.onServerResponseError)
            },


            toBatchCreateModel (){
                this.$router.push(`${this.model.getListUrl()}batch?${this.model.config.title_field}=${this.search.search}`)
            },

            toCreateModel(){
                import(`@/views${this.model.getListUrl()}form.vue`).catch(() => {
                    return import('vue-django/src/components/model/Form.vue')
                }).then(m => {
                    this.creator = m.default
                    this.editing = true
                })
            },

            normalizeItems(){
                this.getConfig().then(config => {

                    this.batchActionItems = array_normalize(config.batchActions, this.avairableActions, (a) => {
                        if (!a.do) {
                            a.do = this.defaultBatchActionDo(a)
                        }
                        return a
                    })

                    let qns = Object.keys(this._baseQueries)
                    let rs = array_normalize(config.listItems, this.model.fieldConfigs, (a) => {
                        Object.assign(a, {field: this.model.fieldConfigs[a.name]})

                        if (!a.useFormWidget) {
                            a.widget = a.widget || this.defaultWidget(a)
                        }
                        return a
                    }).filter(a => !qns.includes(a.name))
                    if (this.batchActionItems.length > 0) {
                        rs = [{type: 'selection'}].concat(rs)
                    }
                    this.tableItems = rs
                })
            },
            defaultBatchActionDo (action) {
                return ({selection}) => {
                    let ids = selection.map((a) => a.id)
                    return this.$http.post(`${this.model.getListUrl()}${action.api || action.name}/`, {id__in: ids, ...action.context})
                }
            },
            addToParent ({selection}) {
                let d = {}
                let fn = this.parentMultipleRelationField.name
                let oids = this.parent.data[fn]
                d[fn] = oids.concat(selection.map(a => a.id))
                return this.$http.patch(this.parent.getDetailUrl(), d).then(({data}) => {
                    this.parent.data[fn] = data[fn]
                    this.parentQueries = Object.assign({}, this.getParentQueries())
                    return {
                        data: {
                            rows: data[fn].length - oids.length
                        }
                    }
                })
            },
            removeFromParent({row}) {
                let fn = this.parentMultipleRelationField.name
                let d = {}
                d[fn] = this.parent.data[fn].filter(a => a !== row.id)
                return this.$http.patch(this.parent.getDetailUrl(), d).then(({data}) => {
                    this.parent.data[fn] = data[fn]
                    this.parentQueries = Object.assign({}, this.getParentQueries())
                })
            },
            getConfig () {
                return import(`@/views${this.model.getListUrl()}config.js`).then(m => {
                    return m.default
                }).catch(() => {
                    return {}
                }).then(config => {

                    let listItems = this.items || config.listItems || this.model.config.listItems || Object.values(this.model.fieldConfigs).filter(a => ['name', 'title'].includes(a.name))
                    if (!listItems || listItems.length === 0) {
                        listItems = ['__str__']
                    }
                    let batchActions = this.batchActions || config.batchActions || this.model.config.batchActions || []
                    return {listItems, batchActions}
                })
            },
            defaultWidget(f){
                if (f.model) {
                    return ForeignKey
                } else if (f.type == 'boolean') {
                    return TrueFlag
                } else if (['datetime', 'date'].includes(f.type)) {
                    return Date2Now
                } else if (f.choices) {
                    return ChoicesDisplay
                } else if (f.child) {
                    return function ({value}) {
                        return value.map(a => Object.values(a).join(',')).join('\n')
                    }
                }
            },
            excelFormat(data){
                let ds = data.map((d) => {
                    return this.tableItems.map((a) => {
                        let v = d[a.name]
                        if (a.choices) {
                            return a.choices.find(a => a.value === v).display_name
                        } else if (a.model) {
                            return d[`${a.name}_name`]
                        }
                        return v

                    })
                })
                return [this.tableItems.map((a) => a.label)].concat(ds)
            },
            checkPermission(p){
                return this.model.checkPermission(p, this.$store.state.user.permissions)
            },
            getParentQueries() {
                let r = {}
                if (this.parent) {
                    let parent = this.parent
                    let f = this.parentMultipleRelationField
                    if (f) {
                        let ids = parent.data[f.name]
                        r['id__in'] = ids.length > 0 && ids || [0]
                    } else {
                        let am = parent.appModel
                        let pid = parent.data.id
                        let fs = Object.values(this.model.fieldConfigs)
                        let f = fs.find(a => a.model === am)
                        if (f && f.multiple !== true) {
                            r[f.name] = pid
                        } else {
                            f = fs.find(a => a.model === 'contenttypes.contenttype')
                            if (f) {
                                r[f.name] = this.parent.options.content_type_id
                                r[`${f.name.replace('_type', '_id')}`] = pid
                            }
                        }

                    }
                }
                return r
            },
            onSelectionChange (selection) {
                this.selection = selection
            }
        },
        computed: {
            parentMultipleRelationField () {
                if (this.parent) {
                    let pfs = Object.values(this.parent.fieldConfigs)
                    let f = pfs.find(a => a.model === this.model.appModel)
                    if (f && f.multiple === true) {
                        return f
                    }
                }
            },
            rtOptions () {
                let bactions = {}
                if (this.model.config.actions) {
                    this.model.config.actions.forEach(a => {
                        bactions[a.name] = a
                        a.do = () => {
                            this.$router.push(`${this.model.getListUrl()}${a.name}/`)
                        }
                    })
                }
                return mergeOptions({
                    table: {
                        avairableActions: {...this.avairableActions, ...bactions},
                        excelFormat: this.excelFormat,
                        topActions: ['refresh', 'create', ['download'].concat(Object.keys(bactions))],
                        rowActions: ['edit', [this.parentMultipleRelationField ? 'removeFromParent' : 'delete']],
                        dblClickAction: 'edit',
                        elTable: {
                            onSelectionChange: this.onSelectionChange
                        },
                        title: this.model.config.verbose_name
                    }
                }, this.options.remoteTable)
            },
//            parentQueries () {
//                return this.getParentQueries()
//            },
            _baseQueries () {
                return Object.assign({}, this.parentQueries, this.baseQueries)
            }
        },
        watch: {
            items (val) {
                this.normalizeItems()
            },
            batchActions (val) {
                this.normalizeItems()
            }
        }
    }
</script>
