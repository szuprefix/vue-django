/**
 * Created by denishuang on 2018/4/23.
 */
import model_view from './model_view'
import table_view from './table_view'

import TrueFlag from '../components/widgets/TrueFlag.vue'
import Date2Now from '../components/widgets/Date2Now.vue'
import ForeignKey from '../components/widgets/ForeignKey.vue'
export default {
    mixins: [model_view, table_view],
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
                    do: this.tableLoad
                },
                'create': {
                    icon: 'plus',
                    title: '创建',
                    do: this.tableToCreateModel
                },
                'edit': {
                    icon: 'pencil',
                    title: '编辑',
                    do: this.tableToEditModel
                }
            }
        }
    },
    created(){
        this.$store.state.bus.$on('model-posted', this.modelTableOnModelPosted)
    },
    beforeDestroy () {
        this.$store.state.bus.$off('model-posted', this.modelTableOnModelPosted)
    },
    components: {},
    methods: {
        modelTableInit(){
            this.modelInit()
            if (!this.tableUrl) {
                this.tableUrl = this.modelListUrl
            }
            this.tableLoad()
            this.modelLoadOptions().then((data) => {
                let search = this.modelOptions.actions.SEARCH
                this.modelTableOrderingFields = search.ordering_fields
                this.modelTableSearchFields = search.search_fields
                this.modelTableFilterFields = search.filter_fields.map((a) => {
                    return Object.assign({multiple: false}, this.modelFieldConfigs[a])
                })
                Object.assign(this.modelTableFilters, this.getFilters())
                this.modelTableItems = Object.assign({}, this.tableNormalizeItems(this.tableItems))
            })
        },
        modelTableOnModelPosted({model}){
            if (model.fullName === this.appModelName || this.modelConfig.dependents && this.modelConfig.dependents.indexOf(model.fullName) >= 0) {
                this.tableLoad()
            }
        },
        tableDefaultWidget(f){
            // console.log(f)
            return f.model ? ForeignKey : (f.type == 'boolean' ? TrueFlag : ( f.type == 'datetime' ? Date2Now : undefined))
        },
        choices2selectOptions(choices){
            return choices.map((a) => {
                return {text: a.display_name, value: a.value}
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
            })
            return filters
        }
    },
    computed: {
        modelTableSearchFieldNames () {
            return this.modelTableSearchFields.join(',')
        },

        modelTableTitle(){
            return `${this.modelConfig.verbose_name}列表`
        },
    }
}