<template>
    <div>
        <search v-model="search" :options="searchOptions" :model="model" :exclude="_baseQueries" ref="search"
                @change="onSearch"></search>
        <div v-if="showTopBar">
            <p v-if="batchActionItems && batchActionItems.length>0"/>
            <batch-actions :items="batchActionItems" :count="selectionCount" @done="refresh"
                           v-if="batchActionItems"></batch-actions>

        </div>
        <el-drawer :visible.sync="editing" direction="rtl" title="新增" size="66%">
            <slot name="create">
                <component :is="creator" :appModel="model.appModel" :defaults="parentQueries"
                           :topActions="['saveAndAnother']" @form-posted="editing=false"></component>
            </slot>
        </el-drawer>

        <remote-table :items="tableItems" :url="model.getListUrl()" ref="table" @loaded="onLoaded"
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

    import TrueFlag from '../widgets/TrueFlag.vue'
    import ChoicesDisplay from '../widgets/ChoicesDisplay.vue'
    import Date2Now from '../widgets/Date2Now.vue'
    import ForeignKey from '../widgets/ForeignKey.vue'
    import Search from './Search.vue'

    export default{
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
            }
        },
        data () {
            return {
                model: Model(this.appModel, {}, this.$store.state.bus),
                tableItems: [],
                search: {},
                creator: undefined,
                editing: false,
                avairableActions: {
                    'create': {
                        icon: 'plus',
                        title: '创建',
                        do: this.toCreateModel,
                        show: () => this.checkPermission('add')
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
                    'batch': {
                        icon: 'archive',
                        title: '批量创建',
                        do: this.toBatchCreateModel,
                        show: () => this.checkPermission('add')
                    }
                }
            }
        },
        components: {RemoteTable, Search},
        created () {
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
                    this.$refs.table.updateQueries({})
                })
            },
            getItems () {
                if (this.items) {
                    return Promise.resolve(this.items)
                }
                return import(`@/views${this.model.getListUrl()}config.js`).then(m => {
                    return m.default.listItems
                })
            },
            onLoaded (v) {
                this.$emit('loaded', v)
            },
            onSearch () {
                this.$refs.table.updateQueries(this.search)
            },
            onModelPosted ({model}) {
                let dps = this.model.options.dependencies
                if (model.appModel === this.appModel || dps && dps.includes(model.appModel)) {
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
                const path = this.model.getDetailUrl(row.id)
                this.$router.push(path)
//                this.resolveCurrentTagLabel(path, `编辑${row.__str__}`)
            },

            toDeleteModel ({row}){
                return this.$confirm(`确定要删除${row.__str__}吗?`, {type: 'warning'}).then(() => {
                    return this.model.delete(row.id)
                }).catch(this.onServerResponseError)
            },


            toBatchCreateModel (){
                this.$router.push(`${this.model.getListUrl()}batch?${this.model.config.title_field}=${this.queries.search}`)
            },

            toCreateModel(){
                import(`@/views${this.model.getListUrl()}form.vue`).catch(() => {
                    return import('vue-django/src/components/model/Form.vue')
                }).then(m => {
                    this.creator = m.default
                    this.editing = true
                })
//                let createUrl = `${this.model.getListUrl()}create`
//                if (!!this.model.config.title_field && !!this.queries.search) {
//                    createUrl = `${createUrl}?${this.model.config.title_field}=${this.queries.search}`
//                }
//                const path = createUrl
//                this.$router.push(path)
//                this.resolveCurrentTagLabel(path, `新增${this.model.config.verbose_name}`)
            },

            normalizeItems(){
                return this.getItems().then(items => {
                    let qns = Object.keys(this._baseQueries)
                    this.tableItems = array_normalize(items, this.model.fieldConfigs, (a) => {
                        Object.assign(a, {field: this.model.fieldConfigs[a.name]})

                        if (!a.useFormWidget) {
                            a.widget = a.widget || this.defaultWidget(a)
                        }
                        return a
                    }).filter(a => !qns.includes(a.name))
                })
            },

            defaultWidget(f){
                // console.log(f)
                return f.model ? ForeignKey :
                    (f.type == 'boolean' ? TrueFlag :
                        ( ['datetime', 'date'].includes(f.type) ? Date2Now :
                            f.choices ? ChoicesDisplay : undefined))
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
                    let am = this.parent.appModel
                    let pid = this.parent.data.id
                    let fs = Object.values(this.model.fieldConfigs)
                    let f = fs.find(a => a.model === am)
                    if (f) {
                        r[f.name] = pid
                    } else {
                        f = fs.find(a => a.model === 'contenttypes.contenttype')
                        if (f) {
                            r[f.name] = this.parent.options.content_type_id
                            r[`${f.name.replace('_type', '_id')}`] = pid
                        }
                    }
                }
                console.log(r)
                return r
            }
        },
        computed: {

            rtOptions () {
                return mergeOptions({
                    table: {
                        avairableActions: this.avairableActions,
                        excelFormat: this.excelFormat,
                        topActions: ['refresh', 'download', 'create'],
                        rowActions: ['edit', 'delete'],
                        dblClickAction: 'edit',
//                        elTable: {onRowDblClick:this.onRowSelect}
                    }
                }, this.options.remoteTable)
            },
            parentQueries () {
                return this.getParentQueries()
            },
            _baseQueries () {
                return {...this.parentQueries, ...this.baseQueries}
            }
        },
        watch: {
            items (val) {
                this.normalizeItems(val)
            },
        }
    }
</script>
