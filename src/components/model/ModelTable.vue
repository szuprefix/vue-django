<template>
    <div style="display: block">
        <el-table :data="table.data" @row-dblclick="rowDblClick" @selection-change="selectionChange" :class="{'table-show-index':showIndex}">
            <el-table-column type="selection" width="50" v-if="hasAction"></el-table-column>
            <el-table-column type="index" width="50" class="table-column-index" v-if="showIndex"></el-table-column>
            <el-table-column :prop="c.name" :label="c.header" :key="c.name"
                             :sortable="c.orderable" v-for="c in table.columns">
                <template scope="scope"><span v-html="scope.row[c.name]"></span></template>
            </el-table-column>
            <el-table-column label="操作" v-if="Object.keys(itemActions).length>0">
                <template scope="scope">
                    <el-button size="small" @click="doItemAction(scope.$index, scope.row, n, a)" :key="n"
                               v-for="a, n in itemActions">
                        {{a.verbose_name}}
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination
                @current-change="handleCurrentChange"
                layout="total, prev, pager, next, jumper"
                :current-page="table.pager.current"
                :page-size="table.pager.per_page"
                :total="table.pager.total" v-if="table.pager">
        </el-pagination>
    </div>

</template>
<script>
    import Qs from 'qs'
    import server_response from '../../mixins/server_response'
    export default{
        props: {
            url: String,
            queries: {
                type: Object, default () {
                    return {}
                }
            },
            showIndex: {type: Boolean, default: false},
            itemActions: {
                type: Object, default(){
                    return {}
                }
            },
            hasAction: {
                type: Boolean, default: false
            },
            routeFunc: Function
        },
        mixins: [server_response],
        data () {
            return {
                table: {},
                currentPage: 1,
                total: 0
            }
        },
        created (){
            this.loadData()
        },
        components: {},
        methods: {
            handleCurrentChange (val) {
                this.loadData(val)
            },
            loadData (page) {
                let d = this.queries
                d.page = page || 1
                this.$http.get(`${this.url}?${Qs.stringify(d)}`).then(({data}) => {
                    this.table = data.data.table
                    this.$emit("loaded", data)
                }).catch(this.onServerResponseError)
            },
            rowDblClick (row, event){
                if (this.routeFunc) {
                    this.$router.push(this.routeFunc(row))
                }
//                console.log(row)
            },
            doItemAction(index, row, action_name, action){
                this.$store.state.bus.$emit(`${this.modelName}.${action_name}`, {index, row, action})
            },
            selectionChange(val){
                this.$emit("selection-change", val)
            }
        },
        computed: {

        }
    }
</script>
<style>
    .table-show-index .el-table_1_column_1 .cell {
        word-break: keep-all;
    }
</style>