<template>
    <grid :items="tableItems" :value.sync="data" v-if="optionLoaded"></grid>
</template>
<script>
    import Grid from '../table/Grid.vue'
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
                data: [],
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
                        show: () => this.checkPermission('create')
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
                        show: () => this.checkPermission('update')
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
                        show: () => this.checkPermission('update', this.parent)
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
        components: {Grid, Search, BatchActions},
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
                    if (this.$refs.search) {
                        this.$refs.search.init()
                    }
                    this.parentQueries = Object.assign({}, this.getParentQueries())
                    return this.normalizeItems()
                }).then(() => {
                    this.optionLoaded = true
                    this.load()
                }).catch(this.onServerResponseError)
            },
            load (queris) {
                let d = queris || this.queries
                this.loading = '查询中'
                return this.$http.get(`${this.model.getListUrl()}?${Qs.stringify(d, {arrayFormat: 'comma'})}`).then(({data}) => {
                    this.data = data.results
                    this.count = data.count
                    this.loading = false
                    this.$emit("loaded", this.data)
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

                        if (!a.useFormWidget) {
                            a.widget = a.widget || this.defaultWidget(a)
                        }
                        if (orderingFields.includes(a.name)) {
                            a.sortable = true
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
                let config = this.model.viewsConfig.list || {}
                let listItems = this.items || config.grid || config.items || Object.values(this.model.fieldConfigs).filter(a => ['name', 'title'].includes(a.name))
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
            checkPermission(p, m){
                m = m || this
                return this.$store.state.user.model_permissions[m.appModel].includes(p)
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
                                r[ct_field] = this.parent.options.content_type_id
                                if (!this.model.fieldConfigs[fk_field]) {
                                    throw Error(`genric foreign key id_field:${id_field} not found.`)
                                }
                                r[fk_field] = pid
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
                return null
            },
            rtAttrs () {
                let bactions = {}
                if (this.model.config.actions) {
                    this.model.config.actions.forEach(a => {
                        bactions[a.name] = a
                        a.do = () => {
                            this.$router.push(`${this.model.getListUrl()}${a.name}/`)
                        }
                    })
                }
                let avairableActions = {...this.avairableActions, ...bactions}
                return {
                    topActions: ['refresh', 'create', ['download'].concat(Object.keys(bactions))],
                    rowActions: ['edit', [this.parentMultipleRelationField ? 'removeFromParent' : 'delete']],
                    excelFormat: this.excelFormat,
                    permissionFunction: this.checkPermission,
                    dblClickAction: 'edit',
                    title: this.model.config.verbose_name,
                    ...this.$attrs,
                    baseQueries: this._baseQueries,
                    avairableActions
                }
            },
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
