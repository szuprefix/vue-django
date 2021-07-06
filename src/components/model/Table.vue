<template>
    <div>
        <search v-model="search" :model="model" :items="searchItems" :exclude="_baseQueries" ref="search"
                v-if="showSearch && optionLoaded" :map="searchMap" @change="onSearch"></search>
        <batch-actions :items="batchActionItems" @done="refresh" :context="{selection,count,parent,model}"
                       v-if="batchActionItems.length>0"></batch-actions>
        <el-drawer :visible.sync="editing" direction="rtl"
                   :title="`${parentMultipleRelationField?'添加':'创建'}${model.config.verbose_name}`" size="66%">
            <slot name="edit">
                <model-table :appModel="appModel" :options="{remoteTable:{table:{topActions:[], rowActions:[]}}}"
                             :batchActions="[{name:'add', label:`添加到${parent.title()}`, type:'primary', confirm:false, do:addToParent}]"
                             v-if="parentMultipleRelationField"></model-table>
                <component :is="creator" :appModel="appModel" :defaults="createDefaults" v-else
                           :parent="parent" :topActions="['saveAndAnother']"></component>

            </slot>
        </el-drawer>

        <remote-table :items="tableItems" :url="model.getListUrl()" ref="table" v-if="optionLoaded"
                      @loaded="onLoaded" v-bind="rtAttrs" v-on="$listeners" @selection-change="onSelectionChange">

            <template slot="left" v-if="$slots.left">
                <slot name="left"></slot>
            </template>
            <template slot="right" v-if="$slots.right">
                <slot name="right"></slot>
            </template>
        </remote-table>
    </div>
</template>
<script>
    import RemoteTable from '../table/RemoteTable.vue'
    import Model from './Model'
    import arrayNormalize from '../../utils/array_normalize'
    import ServerResponse from '../../mixins/server_response'
    import Qs from 'qs'
    import {get} from 'lodash'
    import BatchActions from '../layout/BatchActions.vue'

    import TrueFlag from '../widgets/TrueFlag.vue'
    import ChoicesDisplay from '../widgets/ChoicesDisplay.vue'
    import Date2Now from '../widgets/Date2Now.vue'
    import ForeignKey from '../widgets/ForeignKey.vue'
    import Search from './Search.vue'
    import ContentType from '../generic/ContentType'

    export default{
        name: 'ModelTable',
        mixins: [ServerResponse],
        props: {
            appModel: String,
            items: Array,
            searchItems: Array,
            showSearch: {type: Boolean, default: true},
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
                count: 0,
                avairableActions: {
                    'create': {
                        icon: 'plus',
                        title: '创建',
                        do: this.toCreateModel,
                        show: () => this.parentMultipleRelationField && this.checkPermission('partial_update', this.parent) || this.checkPermission('create')
                    },
                    'add': {
                        icon: 'plus-square',
                        label: '添加',
                        do: this.addToParent,
                        show: () => this.checkPermission('create') && this.checkPermission('update', this.parent)
                    },
                    'edit': {
                        icon: 'pencil',
                        title: '编辑',
                        do: this.toEditModel,
                        show: () => this.checkPermission('update') || this.checkPermission('partial_update') || this.checkPermission('retrieve')
                    },
                    'delete': {
                        icon: 'trash',
                        title: '删除',
                        do: this.toDeleteModel,
                        type: 'danger',
                        show: () => this.checkPermission('destroy')
                    },
                    'removeFromParent': {
                        icon: 'trash',
                        title: '移除',
                        do: this.removeFromParent,
                        show: () => this.checkPermission('partial_update', this.parent)
                    },
                    'batch': {
                        icon: 'archive',
                        title: '批量创建',
                        do: this.toBatchCreateModel,
                        show: () => this.checkPermission('create')
                    },
                    ...this.$attrs.avairableActions
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
                this.model.loadOptionsAndViewsConfig().then(() => {
                    this.parentQueries = Object.assign({}, this.getParentQueries())
                    return this.normalizeItems()
                }).then(() => {
                    this.optionLoaded = true
                }).catch(this.onServerResponseError)
            },
            refresh () {
                this.$refs.table.refresh()
            },
            onLoaded (v) {
                this.count = v.count
                this.$emit('loaded', v)
            },
            onSearch (qd) {
                this.search = {...qd}
                this.$refs.table.updateQueries({...qd, page: 1})
            },
            onModelPosted ({appModel, id}) {
                let dps = this.model.options.dependencies
                if (appModel === this.appModel || dps && dps.includes(appModel)) {
                    this.$refs.table.load()
                }
            },
//            onRowSelect (row, column, cell, event) {
//                if (this.onDBClick) {
//                    this.onDBClick(row, column, cell, event)
//                } else if (this.rowActions.includes('edit') && this.modelCheckPermission('change')) {
//                    this.toEditModel({row, column, cell, event})
//                }
//            },

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

                    this.batchActionItems = arrayNormalize(config.batchActions, this.avairableActions, (a) => {
                        if (!a.do) {
                            a.do = this.defaultBatchActionDo(a)
                        }
                        return a
                    })

                    let qns = Object.keys(this._baseQueries)
                    let orderingFields = get(this.model.options, 'actions.SEARCH.ordering_fields', [])
                    let rs = arrayNormalize(config.listItems, this.model.fieldConfigs, (a) => {
                        Object.assign(a, {field: this.model.fieldConfigs[a.name]})
                        if (!a.formatter) {
                            a.formatter = this.genDefaultFormatter(a)
                        }
                        if (!a.useFormWidget) {
                            a.widget = a.widget || this.defaultWidget(a)
                        }
                        if (orderingFields.includes(a.name)) {
                            a.sortable = 'custom'
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
                return ({selection, scope}) => {
                    let ids = selection.map((a) => a.id)
                    let qd = {...this._baseQueries, ...this.search}
                    return this.$http.post(`${this.model.getListUrl()}${action.api || action.name}/?${Qs.stringify(qd, {arrayFormat: 'comma'})}`, {
                        batch_action_ids: ids, ...action.context,
                        scope
                    }).catch(this.onServerResponseError)
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
                }).catch(this.onServerResponseError)
            },
            removeFromParent({row}) {
                let fn = this.parentMultipleRelationField.name
                let d = {}
                d[fn] = this.parent.data[fn].filter(a => a !== row.id)
                return this.$http.patch(this.parent.getDetailUrl(), d).then(({data}) => {
                    this.parent.data[fn] = data[fn]
                    this.parentQueries = Object.assign({}, this.getParentQueries())
                }).catch(this.onServerResponseError)
            },
            getConfig () {
                let config = this.model.viewsConfig.list || {}
                let listItems = this.items || config.table || config.items || Object.values(this.model.fieldConfigs).filter(a => ['name', 'title'].includes(a.name))
                if (!listItems || listItems.length === 0) {
                    listItems = ['__str__']
                }
                let batchActions = this.batchActions || config.batchActions || []
                return Promise.resolve({listItems, batchActions})
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
                    return function (value, field) {
                        let d = value[field.name]
                        let sfs = field.child.children
                        return d.map(r => Object.keys(sfs).map(sf => r[sf]).join(',')).join('\n')
                    }
                }
            },
            genDefaultFormatter (f) {
                if (f.choices) {
                    return (d, n, v) => f.choices.find(a => a.value === v).display_name
                } else if (f.model) {
                    return (d, n, v) => d[`${f.name}_name`]
                }
            },

            checkPermission (p, m) {
                m = m || this
                let ps = this.$store.state.user.model_permissions[m.appModel]
                return ps && ps.includes(p)
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
                        let pid = parent.id
                        let fs = Object.values(this.model.fieldConfigs)
                        let f = fs.find(a => a.model === am)
                        if (f && f.multiple !== true) {
                            r[f.name] = pid
                        } else {
                            let popt = this.model.options
                            if (popt.generic_foreign_key) {
                                let {ct_field, fk_field} = popt.generic_foreign_key
                                r[ct_field] = ContentType.getId(this.parent.appModel)
                                if (!this.model.fieldConfigs[fk_field]) {
                                    throw Error(`genric foreign key id_field:${id_field} not found.`)
                                }
                                r[fk_field] = pid || undefined
                            }
                        }

                    }
                    try{
                        this.addSearchParentQueries(r)
                    }catch(e){
                        console.error(e)
                    }
                }
                return r
            },
            addSearchParentQueries(d) {
                let model = this.model
                let sf = model.options.actions.SEARCH.filter_fields.find(a => {
                    if (a.name.includes('__')) {
                        let pn = a.name.split('__').pop()
                        if (this.parent.appModel.endsWith(`.${pn}`)) {  // todo: 临时代码，这里有待写得更严谨
                            return true
                        }
                    }
                })
                if (sf) {
                    d[sf.name] = this.parent.id
                }
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
                return null
            },
            rtAttrs () {
                let mc = this.model.config
                let bactions = {}
                if (mc.actions) {
                    mc.actions.forEach(a => {
                        bactions[a.name] = a
                        a.do = ({row}) => {
                            if (a.detail) {
                                console.log(row, mc.idField || 'id')
                                this.$router.push(`${this.model.getDetailUrl(row[mc.idField || 'id'])}${a.name}`)
                            } else {
                                this.$router.push(`${this.model.getListUrl()}${a.name}`)
                            }
                        }
                    })
                }
                let ractions = {}
                if (mc.itemActions) {
                    mc.itemActions.forEach(a => {
                        ractions[a.name] = a
                        if (!a.do) {
                            a.do = ({row}) => {
                                this.$router.push(`${this.model.getDetailUrl(row.id)}${a.name}/`)
                            }
                        }
                    })
                }

                let avairableActions = {...this.avairableActions, ...bactions, ...ractions}
                let topActions = ['refresh', 'create', ['download'].concat(Object.keys(bactions))]
                let rowActions = ['edit'].concat(Object.keys(ractions)).concat([[this.parentMultipleRelationField ? 'removeFromParent' : 'delete']])
                let title = this.model.config.verbose_name
                if (this.parent) {
                    title = `${this.parent.title()}${title}`
                }
                return {
                    topActions,
                    rowActions,
//                    excelFormat: this.excelFormat,
                    permissionFunction: this.checkPermission,
                    dblClickAction: 'edit',
                    title,
                    ...this.$attrs,
                    baseQueries: this._baseQueries,
                    avairableActions,
                    ...get(this.model, 'viewsConfig.list.options.remoteTable')
                }
            },
            _baseQueries () {
                return Object.assign({}, this.parentQueries, this.baseQueries)
            },
            searchMap () {
                let d = {}
                this.tableItems.forEach(a => {
                    d[a.name] = {name: a.name, label: a.label}
                })
                return d
            },
            createDefaults () {
                return {...this.baseQueries, ...this.parentQueries}
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
