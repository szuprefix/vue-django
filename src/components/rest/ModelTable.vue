<template>
    <div>
        <el-row :gutter="20" v-if="showTopBar" class="filterbox">
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
                <template v-for="f in modelTableFilterFields" v-if="! (f.name in tableBaseQueries)">
                    <el-select v-model="tableQueries[f.name]" clearable :placeholder="`请选择${f.label}`"
                               v-if="f.type=='boolean'" @change="tableOnSearch">
                        <el-option :label="f.label" :value="true"></el-option>
                        <el-option :label="`非${f.label}`" :value="false"></el-option>
                    </el-select>
                    <!--<el-switch v-model="tableQueries[f.name]" :active-text="f.label" :inactive-value="null"-->
                    <!--@change="tableUpdateQueries" v-if="f.type=='boolean'" :false-label="''">{{f.label}}-->
                    <!--</el-switch>-->
                    <related-select :field="f" v-model="tableQueries[f.name]" @input="tableOnSearch"
                                    :showCreate="false"
                                    v-if="f.model" :modelListSubUrl="modelListSubUrl"
                                    :tablePageSize="100"></related-select>
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
                                       v-if="!a.show || a.show()" :key="a.name">
                                <i :class="`fa fa-${a.icon}`"></i>
                            </el-button>
                        </el-button-group>
                    </slot>
                </div>
            </el-col>
        </el-row>
        <div v-if="batchActionItems && batchActionItems.length>0">
            <el-button plain :icon="a.icon" v-for="a in batchActionItems" @click="onCommand(a.name)" :disabled="selectionCount==0"
                        :key="a.name">{{a.label}}</el-button>
        </div>
        <el-table :data="tableData" @row-dblclick="tableOnRowSelect" @sort-change="onSortChange" :max-height="maxHeight"
                  @selection-change="onModelTableSelectionChange"
                  @filter-change="onFilterChanged" v-loading="loading" :element-loading-text="loadingText" ref="table">
            <slot name="left">
            </slot>
            <el-table-column :prop="f.name" :column-key="f.name" :label="f.label || f.name"
                             :min-width="f.min_width" :width="f.width" :fixed="f.fixed"
                             :align="['number','integer'].includes(f.type)?'right':'left'"
                             :sortable="modelTableOrderingFields.includes(f.name) && 'custom'" :class-name="f.type"
                             :type="f.type" :filters="modelTableFilters[f.name]" v-for="f in modelTableItems"
                             :filter-method="filterHandler"
                             :key="f.name">
                <template slot-scope="{row}">
                    <component :is="f.widget" v-model="row" :prop="f.name" :field="f.field"
                               v-if="f.widget && typeof f.widget == 'object'"></component>
                    <span v-else-if="f.widget && typeof f.widget == 'function'" v-html="f.widget(row)"></span>
                    <template v-else>{{row[f.name]}}</template>
                </template>
            </el-table-column>
            <el-table-column label="" :min-width="`${60*rowActionList.length}px`" align="right">
                <template slot-scope="{row}">
                    <el-button-group class="hover-show">
                        <el-button :title="a.title" size="small" @click="a.do(row)" v-for="a in row_actions"
                                   v-if="!a.show || a.show()" :key="a.name">
                            <i :class="`fa fa-${a.icon}`"></i>
                        </el-button>
                    </el-button-group>
                </template>
            </el-table-column>

            <slot name="right">
            </slot>
        </el-table>
        <div class="stick-bottom model-table-pager-container">
            <el-pagination v-if="showPagger"
                           background
                           layout="total, sizes, prev, pager, next, jumper"
                           :page-size="tablePageSize"
                           :current-page.sync="tablePage"
                           @size-change="tableOnPageSizeChanged"
                           :total="tableCount">
            </el-pagination>
        </div>
    </div>
</template>
<style>
    .filterbox .related-select {
        width: 10rem;
    }
</style>
<script>
    import model_table from '../../mixins/model_table'
    import RelatedSelect from './RelatedSelect.vue'
    export default{
        mixins: [model_table],

        components: {
            RelatedSelect
        },
        mounted (){
            this.modelTableInit()
        },
        data(){
           return {
               selectionCount:0
           }
        },
        methods: {
            onModelTableSelectionChange(selection){
                this.selectionCount = selection.length
                this.$emit("selection-change", selection)
            },
            onCommand(name){
                let rc = this.selection.length
                if (rc == 0) {
                    this.$message('请先勾选至少一条记录')
                    return
                }
                let action = this.batchActionItems.find((a) => a.name == name)
                if (action && action.do) {
                    this.$confirm(`确定要对勾选中的${rc}条记录执行"${action.label}"操作吗?`, action.notice, {type: 'warning'}).then(() => {
                        action.do(name).then(({data}) => {
                            this.$message(`操作成功 ${data.rows}`)
                            this.modelTableRefresh()
                        })
                    }).catch(this.onServerResponseError)
                }
                this.$emit("command", name)
            },
            toggleRowExpansion(row, expanded){
                this.$refs.table.toggleRowExpansion(row, expanded)
            },
            filterHandler(value, row, column) {
                return true
//                console.log(column)
//                const property = column['property']
//                console.log(property)
//                return row[property] === value
            },
            onFilterChanged(filters){
                let d = {}
                Object.keys(filters).forEach((a) => {
                    let v = filters[a]
                    if (v instanceof Array) {
                        d[`${a}__in`] = v.join(",")
                    } else {
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
        computed: {
            selection(){
                return this.$refs.table.selection
            },
            selectionIds(){
                return this.selection.map((a) => a.id)
            },
            maxHeight(){
                return window.screen.availHeight
            }
        },
        watch: {
            tableData(val){
                this.$emit("input", val)

            }
        }
    }
</script>
<style>
    .model-table-pager-container {
        background-color: white;
        right: 0px;
    }
</style>
