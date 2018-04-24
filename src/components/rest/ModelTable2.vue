<template>
    <div>
        <el-row :gutter="20">
            <el-col :span="16">
                <el-input
                        :placeholder="`搜索${searchFieldNames}`"
                        v-model="tableQueries.search"
                        @keyup.enter.native="tableUpdateQueries({})" :style="`width:${100+20*searchFieldNames.length}px`"
                        v-if="search_fields.length>0">
                </el-input>
                <template v-for="f in filterFields">
                    <el-checkbox v-model="tableQueries[f.name]" :active-text="f.label" :inactive-value="null"
                                 @change="tableUpdateQueries({})" v-if="f.type=='boolean'">{{f.label}}
                    </el-checkbox>
                    <el-select multiple collapse-tags v-model="queries[f.name]" v-else
                               :placeholder="`请选择${f.label}`" style="width:150px">
                        <el-option
                                v-for="item in f.choices"
                                :key="item.value"
                                :label="item.display_name"
                                :value="item.value">
                        </el-option>
                    </el-select>
                    &nbsp;
                </template>
                <el-button><i class="fa fa-search"></i></el-button>
            </el-col>
            <el-col :span="8">
                <div class="flex-right">
                    <slot name="actions">
                        <el-button-group>
                            <el-button :title="a.title" size="small" @click="a.do" v-for="a in top_actions"
                                       :key="a.name">
                                <i :class="`fa fa-${a.icon}`"></i>
                            </el-button>
                        </el-button-group>
                    </slot>
                </div>
            </el-col>
        </el-row>
        <el-table :data="tableData" @row-dblclick="onRowSelect" @sort-change="onSortChange"
                  @filter-change="onFilterChanged" v-loading="loading" :element-loading-text="loading">
            <el-table-column :prop="f.name" :column-key="f.name" :label="f.label || f.name"
                             :sortable="ordering_fields.includes(f.name) && 'custom'" :class-name="f.type"
                             :type="f.type" :filters="filters[f.name]" v-for="f in tableItems" :key="f.name">
                <template slot-scope="{row}">
                    <component :is="f.widget" v-model="row" :prop="f.name"
                               v-if="f.widget && typeof f.widget == 'object'"></component>
                    <span v-else-if="f.widget && typeof f.widget == 'function'" v-html="f.widget(row)"></span>
                    <template v-else>{{row[f.name]}}</template>
                </template>
            </el-table-column>
            <el-table-column label="" :width="`${60*rowActionList.length}px`">
                <template slot-scope="{row}">
                    <el-button-group class="hover-show">
                        <el-button :title="a.title" size="small" @click="a.do(row)" v-for="a in row_actions"
                                   :key="a.name">
                            <i :class="`fa fa-${a.icon}`"></i>
                        </el-button>
                    </el-button-group>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination
                background
                layout="total, sizes, prev, pager, next, jumper"
                :page-size="pageSize"
                :current-page.sync="page"
                @size-change="onPageSizeChanged"
                :total="count">
        </el-pagination>
    </div>
</template>
<script>
    import model_view from '../../mixins/model_view'
    import table_view from '../../mixins/table_view'
    import TrueFlag from '../widgets/TrueFlag.vue'
    import Date2Now from '../widgets/Date2Now.vue'
    export default{
        mixins: [model_view, table_view],
        props: {
            appModelName: String,
            tableItems: {
                type: Array, default: function () {
                    return [{name: '__str__', label: '名称'}]
                }
            },
            extraActions: {
                type: Object, default: function () {
                    return {}
                }
            },
            tableUrl: String,
            topActionList: {
                type: Array, default: function () {
                    return ['refresh', 'create']
                }
            },
            rowActionList: {
                type: Array, default: function () {
                    return ['edit']
                }
            },
        },
        mounted (){
            this.modelInit()
            if (!this.tableUrl) {
                this.tableUrl = this.modelListUrl
            }
            this.tableLoad()
            this.modelLoadOptions().then((data) => {
                let search = this.modelOptions.actions.SEARCH
                this.ordering_fields = search.ordering_fields
                this.search_fields = search.search_fields
                this.filter_fields = search.filter_fields
                Object.assign(this.filters, this.getFilters())
                this.tableItems = Object.assign({}, this.tableNormalizeItems(this.tableItems))
            })
        },
//        mounted (){
//            Object.assign(this.avairable_actions, this.extraActions)
////            this.modelLoadFormConfig().then((data) => {
////
////
////            })
//        },
        data () {
            return {
                filters: {},
                ordering_fields: [],
                filter_fields: [],
                search_fields: [],
                avairable_actions: {
                    'refresh': {
                        icon: 'refresh',
                        title: '刷新',
                        do: this.load
                    },
                    'create': {
                        icon: 'plus',
                        title: '创建',
                        do: this.toCreateModel
                    },
                    'edit': {
                        icon: 'pencil',
                        title: '编辑',
                        do: this.toEditModel
                    }
                }
            }
        },
        computed: {
            searchFieldNames () {
                return this.search_fields.join(',')
            },
            filterFields () {
                let actions = this.modelOptions.actions
                if (!actions) {
                    return []
                }
                let sms = {}
                let ff = actions.SEARCH.filter_fields
                let rs = []
                rs = ff.map((a) => {
                    let d = Object.assign({}, actions.POST[a])
                    d.name = a
                    return d
                })
                return rs
            },
            top_actions(){
                return this.get_actions(this.topActionList)
            },
            row_actions(){
                return this.get_actions(this.rowActionList)
            }
        },
        methods: {
            get_actions(action_list){
                return action_list.map((a) => {
                    let d = this.avairable_actions[a]
                    d.name = a
                    return d
                })
            },

            tableDefaultWidget(type){
                return type == 'boolean' ? TrueFlag : ( type == 'datetime' ? Date2Now : undefined)
            },
            choices2selectOptions(choices){
                return choices.map((a) => {
                    return {text: a.display_name, value: a.value}
                })
            },
            getFilters(){
                let postFields = this.modelOptions.actions.POST
                let filters = {}

                Object.keys(postFields).forEach((k) => {
                    let f = postFields[k]
                    if (f.choices) {
                        filters[`${k}_name`] = filters[k] = this.choices2selectOptions(f.choices)
                    }
                })
                return filters
            },
            filterHandler(value, row, column) {
                console.log(column)
//                const property = column['property']
//                console.log(property)
//                return row[property] === value
            },
            onFilterChanged(filters){
                console.log(filters)
            },
            onSortChange(payLoad){
                this.updateQueries({ordering: (payLoad.order == 'descending' ? '-' : '') + payLoad.prop})
            }
        },
    }
</script>
