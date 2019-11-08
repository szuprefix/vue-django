<template>
    <div>
        <x-table :items="items" :cellWidget="tOptions.cellWidget" v-model="data" v-loading="loading"
                 :element-loading-text="loading" :topActions="tOptions.topActions" :rowActions="tOptions.rowActions"
                 :headerWidget="tOptions.headerWidget" :group="group" :dblClickAction="tOptions.dblClickAction" :options="tOptions">
        </x-table>
        <!--<div class="pager-container">-->
        <el-pagination v-if="count>pageSize || showPagger"
                       background
                       layout="total, sizes, prev, pager, next, jumper"
                       :page-size="pageSize"
                       :current-page.sync="page"
                       @size-change="onPageSizeChanged"
                       :total="count">
        </el-pagination>
        <!--</div>-->
    </div>

</template>
<script>
    import {DEFAULT_PAGE_SIZE, mergeOptions} from './Table'
    import Qs from 'qs'
    import XTable from './Table.vue'
    import server_response from '../../mixins/server_response'
    import array_normalize from '../../utils/array_normalize'
    export default{
        mixins: [server_response],
        props: {
            items: {type: Array, default: () => []},
            value: Array,
            baseQueries: {
                type: Object, default: () => {
                    return {}
                }
            },
            options: {
                type: Object,
                default: () => {
                    return {}
                }
            },
            url: String,
            pageSize: {type: Number, default: () => DEFAULT_PAGE_SIZE},
        },
        data () {
            return {
                data: [],
                loading: false,
                queries: {page_size: this.pageSize, search: ''},
                page: 1,
                count: 0,
                searchFields: [],
                avairableActions: {
                    'refresh': {
                        icon: 'refresh',
                        title: '刷新',
                        do: this.refresh
                    },
                }
            }
        },
        components: {XTable},
        created () {
            this.updateQueries({})
        },
        methods: {

            updateQueries(d){
                this.queries = Object.assign({}, this.baseQueries, this.queries, d)
            },
            load (queris) {
                let d = queris || this.queries
                this.loading = '查询中'
                return this.$http.get(`${this.url}?${Qs.stringify(d, {arrayFormat: 'comma'})}`).then(({data}) => {
                    this.data = data.results
                    this.count = data.count
                    this.loading = false
                    this.$emit("loaded", this.data)
                }).catch(this.onServerResponseError)
            },
            onSearch(){
                this.updateQueries({page: 1})
            },
            onPageChanged (val) {
                this.page = val
            },
            onPageSizeChanged (val){
                this.pageSize = val
            },
            refresh(){
                this.load()
            },
            excelGetAllData(){
                let d = Object.assign({}, this.queries, {page: 1, page_size: this.count})
                this.loading = '正在获取数据'
                return this.$http.get(`${this.url}?${Qs.stringify(d, {arrayFormat: 'comma'})}`).then(({data}) => {
                    this.loading = false
                    return data.results
                }).catch(this.onServerResponseError)
            }
        },
        computed: {
            tOptions () {
                return mergeOptions({
                    excelGetAllData: this.excelGetAllData,
                    avairableActions: this.avairableActions,
                    topActions:['refresh', 'download']
                }, this.options.table)
            },

        },
        watch: {
            page(newVal, oldVal){
                this.updateQueries({page: newVal})
            },
            pageSize(newVal, oldVal){
                this.updateQueries({page_size: newVal})
            },
            queries(newVal, oldVal){
                this.load(newVal)
            },
            baseQueries (val) {
                this.updateQueries(val)
            }
        }
    }
</script>

