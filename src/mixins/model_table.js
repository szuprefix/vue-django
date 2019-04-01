/**
 * Created by denishuang on 2018/4/23.
 */
import model_view from './model_view'
import table_view from './table_view'

import TrueFlag from '../components/widgets/TrueFlag.vue'
import ChoicesDisplay from '../components/widgets/ChoicesDisplay.vue'
import Date2Now from '../components/widgets/Date2Now.vue'
import ForeignKey from '../components/widgets/ForeignKey.vue'
export default {
    mixins: [model_view, table_view],
    props: {
        appModelName: {
            type: String,
            default: () => ''
        },
        tableItems: {
            type: Array, default: function () {
                return [{name: '__str__', label: '名称'}]
            }
        },
        modelTableUrl: String,
        topActionList: {
            type: Array, default: function () {
                return ['refresh', 'create']
            }
        },
        rowActionList: {
            type: Array, default: function () {
                return ['delete', 'edit']
            }
        },
        showTopBar: {
            type: Boolean, default: function () {
                return true
            }
        },
        showPagger: {
            type: Boolean, default: function () {
                return true
            }
        },
        onTableDBClick: {
            type: Function, default: undefined
        },
        modelListSubUrl:String,
        filterItems: Array,
        batchActionItems: {type:Array, default: () => []}
    },
    data () {
        return {
            modelTableFilters: {},
            modelTableOrderingFields: [],
            modelTableFilterFields: [],
            modelTableSearchFields: [],
            modelTableItems: [],
            modelTableAvairableActions: {
                'refresh': {
                    icon: 'refresh',
                    title: '刷新',
                    do: this.modelTableRefresh
                },
                'create': {
                    icon: 'plus',
                    title: '创建',
                    do: this.tableToCreateModel,
                    show: () => this.modelCheckPermission('add')
                },
                'edit': {
                    icon: 'pencil',
                    title: '编辑',
                    do: this.tableToEditModel,
                    show: () => this.modelCheckPermission('change')
                },
                'delete': {
                    icon: 'trash',
                    title: '删除',
                    do: this.tableToDeleteModel,
                    show: () => this.modelCheckPermission('delete')
                },
                'batch': {
                    icon: 'archive',
                    title: '批量创建',
                    do: this.tableToBatchCreateModel,
                    show: () => this.modelCheckPermission('add')
                }
            }
        }
    },
    created(){
        this.$store.state.bus.$on('model-posted', this.modelTableOnModelPosted)
        this.$store.state.bus.$on('model-deleted', this.modelTableOnModelPosted)
    },
    beforeDestroy () {
        this.$store.state.bus.$off('model-posted', this.modelTableOnModelPosted)
        this.$store.state.bus.$off('model-deleted', this.modelTableOnModelPosted)
    },
    components: {},
    methods: {
        modelTableInit(){
            this.modelInit()
            this.tableUrl = this.modelTableUrl || this.modelListSubUrl && `${this.modelListUrl}${this.modelListSubUrl}/` || this.modelListUrl
            this.tableUpdateQueries({})
            this.modelLoadOptions().then((data) => {
                let search = this.modelOptions.actions.SEARCH
                this.modelTableOrderingFields = search.ordering_fields
                this.modelTableSearchFields = search.search_fields
                let filterItems = this.filterItems || search.filter_fields
                this.modelTableFilterFields = filterItems.map((a) => {
                    return Object.assign({multiple: false}, this.modelFieldConfigs[a])
                })
                this.modelTableFilters = Object.assign({}, this.getFilters())
                this.modelTableItems = this.tableNormalizeItems(this.tableItems)
            })
        },
        modelTableOnModelPosted({model}){
            if (model.fullName === this.appModelName || this.modelConfig.dependents && this.modelConfig.dependents.indexOf(model.fullName) >= 0) {
                this.tableLoad()
            }
        },
        modelTableRefresh(){
            this.tableLoad()
        },
        tableOnRowSelect(row, column, cell, event){
            if (this.onTableDBClick) {
                this.onTableDBClick(row, column, cell, event)
            } else if (this.rowActionList.includes('edit') && this.modelCheckPermission('change')) {
                this.tableToEditModel(row, column, cell, event)
            }
        },

        tableToEditModel (row, ){
            // wayky edit
            const path = this.resolveRoutePath(`/${this.appModelName.replace('.', '/')}/${row.id}`)
            this.$router.push(path)
            this.resolveCurrentTagLabel(path, `编辑${row.__str__}`)
        },

        tableToDeleteModel (row){
            return this.$confirm(`确定要删除${row.__str__}吗?`, {type:'warning'}).then(()=> {
                return this.modelDelete(row.id)
            }).catch(this.onServerResponseError)
        },


        tableToBatchCreateModel (){
            this.$router.push(this.resolveRoutePath(`${this.modelListUrl}batch?${this.modelConfig.title_field}=${this.tableQueries.search}`))
        },

        tableToCreateModel(){
            let createUrl = `${this.modelListUrl}create`
            if (!!this.modelConfig.title_field && !!this.tableQueries.search) {
                createUrl = `${createUrl}?${this.modelConfig.title_field}=${this.tableQueries.search}`
            }
            const path = this.resolveRoutePath(createUrl)
            this.$router.push(path)
            this.resolveCurrentTagLabel(path, `新增${this.modelConfig.verbose_name}`)
        },

        tableNormalizeItems(tableItems){
            return tableItems.map((i) => {
                let a, field
                if (typeof i == 'string') {
                    field = this.modelFieldConfigs[i]
                    if (!field) {
                        console.error(`field ${i} not found`)
                    }
                    a = {
                        name: i,
                        label: field.label || field.name,
                        type: field.type,
                        model: field.model,
                        choices: field.choices,
                        field
                    }
                } else {
                    field = this.modelFieldConfigs[i.name]
                    if (field) {
                        a = Object.assign({}, {
                            label: field.label || field.name,
                            type: field.type,
                            model: field.model,
                            choices: field.choices,
                            field
                        }, i)
                    } else {
                        a = i
                    }
                }

                a.widget = a.widget || this.tableDefaultWidget(a)
                // console.log(a)
                return a
            })
        },

        tableDefaultWidget(f){
            // console.log(f)
            return f.model ? ForeignKey :
                (f.type == 'boolean' ? TrueFlag :
                    ( ['datetime', 'date'].includes(f.type) ? Date2Now :
                        f.choices ? ChoicesDisplay : undefined))
        },
        choices2selectOptions(choices){
            return choices.map((a) => {
                return {text: a.display_name, value: a.value}
            })
        },
        get_actions(action_list){
            return action_list.map((a) => {
                if (a instanceof Object) {
                    return a
                } else {
                    let d = this.modelTableAvairableActions[a]
                    d.name = a
                    return d
                }
            })
        },
        getFilters(){
            let postFields = this.modelFieldConfigs
            let filters = {}

            Object.keys(postFields).forEach((k) => {
                let f = postFields[k]
                if (f.choices) {
                    filters[`${k}_name`] = filters[k] = this.choices2selectOptions(f.choices)
                }
                // else if(f.type == 'boolean'){
                //     filters[k] = [{text:'是', value:true},{text:'否', value:false}]
                // }
            })
            return filters
        }
    },
    computed: {
        modelTableSearchFieldNames () {
            let vns = []
            Object.keys(this.tableBaseQueries).forEach((a) => {
                let c = this.modelFieldConfigs[a]
                if(c){
                    vns.push(c.label)
                }
            })
            return this.modelTableSearchFields.filter((a) => !(a in vns)).join(',')
        },

        modelTableTitle(){
            return `${this.modelConfig.verbose_name}列表`
        },
        top_actions(){
            return this.get_actions(this.topActionList)
        },
        row_actions(){
            return this.get_actions(this.rowActionList)
        }
    }
}
