<template>
    <div>
        <el-row :gutter="20" v-if="showTopBar">
            <el-col :span="16">
                <el-input
                        :placeholder="`搜索${modelTableSearchFieldNames}`"
                        v-model="tableQueries.search"
                        suffix-icon="el-icon-search"
                        @change="tableOnSearch"
                        clearable
                        :style="`width:${80+15*modelTableSearchFieldNames.length}px`"
                        v-if="modelTableSearchFields.length>0">
                </el-input>
                <template v-for="f in modelTableFilterFields">
                    <el-checkbox v-model="tableQueries[f.name]" :active-text="f.label" :inactive-value="null"
                                 @change="tableUpdateQueries" v-if="f.type=='boolean'">{{f.label}}
                    </el-checkbox>
                    <related-select :field="f" v-model="tableQueries[f.name]"  @input="tableUpdateQueries"
                                    style="width: 120px" :showCreate="false" v-if="f.model"></related-select>
                    &nbsp;
                </template>
                <!--<el-button @click="tableLoad"-->
                           <!--v-if="modelTableSearchFields.length>0"><i class="fa fa-search"></i></el-button>-->
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
        <el-table :data="tableData" @row-dblclick="tableOnRowSelect" @sort-change="onSortChange"
                  @filter-change="onFilterChanged" v-loading="loading" :element-loading-text="loading">
            <el-table-column :prop="f.name" :column-key="f.name" :label="f.label || f.name"
                             :min-width="f.min_width" :width="f.width"
                             :sortable="modelTableOrderingFields.includes(f.name) && 'custom'" :class-name="f.type"
                             :type="f.type" :filters="modelTableFilters[f.name]" v-for="f in modelTableItems"
                             :key="f.name">
                <template slot-scope="{row}">
                    <component :is="f.widget" v-model="row" :prop="f.name" :field="f.field"
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
        <el-pagination v-if="showPagger"
                background
                layout="total, sizes, prev, pager, next, jumper"
                :page-size="tablePageSize"
                :current-page.sync="tablePage"
                @size-change="tableOnPageSizeChanged"
                :total="tableCount">
        </el-pagination>
    </div>
</template>
<script>
    import model_table from '../../mixins/model_table'
    import RelatedSelect from './RelatedSelect2.vue'
    export default{
        mixins: [model_table],

        components: {
            RelatedSelect
        },
        mounted (){
            this.modelTableInit()
        },
        computed: {

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
                    let d = this.modelTableAvairableActions[a]
                    d.name = a
                    return d
                })
            },

            filterHandler(value, row, column) {
                console.log(column)
//                const property = column['property']
//                console.log(property)
//                return row[property] === value
            },
            onFilterChanged(filters){
                let d = {}
                Object.keys(filters).forEach( (a) => {
                    let v = filters[a]
                    if(v instanceof Array){
                        d[`${a}__in`] = v.join(",")
                    }else{
                        d[a] = v
                    }
                })
                console.log(d)
                this.tableUpdateQueries(d)
            },
            onSortChange(payLoad){
                this.tableUpdateQueries({ordering: (payLoad.order == 'descending' ? '-' : '') + payLoad.prop})
            }
        },
        watch: {
            tableData(val){
                this.$emit("input", val)

            }
        }
    }
</script>
