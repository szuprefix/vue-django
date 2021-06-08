<template>
    <div v-loading="loading" :element-loading-text="loading">
        <x-table v-model="data" v-on="$listeners" v-bind="[$attrs, $props, tAttrs]" @sort-change="onSortChange">
            <template slot="left" v-if="$slots.left">
                <slot name="left"></slot>
            </template>
            <template slot="right" v-if="$slots.right">
                <slot name="right"></slot>
            </template>
        </x-table>
        <!--<div class="pager-container">-->
        <el-pagination v-if="showPagger"
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
    import {DEFAULT_PAGE_SIZE, DEFAULT_MAX_PAGE_SIZE} from './Table'
    import Qs from 'qs'
    import XTable from './Table.vue'
    import serverResponse from '../../mixins/server_response'
    import queueLimit from '../../utils/async_queue'
    import {range} from 'lodash'

    export default{
        mixins: [serverResponse],
        props: {
            items: {type: Array, default: () => []},
            value: Array,
            baseQueries: {
                type: Object, default: () => {
                    return {}
                }
            },
            url: String,
            showPagger: {
                type: Boolean, default: function () {
                    return true
                }
            },
            pageSize: {type: Number, default: () => DEFAULT_PAGE_SIZE},
            maxPageSize: {type: Number, default: () => DEFAULT_MAX_PAGE_SIZE}
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
                    ...this.$attrs.avairableActions
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
            load (queries) {
                let middleware = {request: d => d, response: d => d , ...this.$attrs.middleware}
                let d = middleware.request(queries || this.queries)
                this.loading = '查询中'
                let func = (this.url instanceof Function) ?  this.url :  d => this.$http.get(`${this.url}?${Qs.stringify(d, {arrayFormat: 'comma'})}`)
                return func(d).then(({data}) => {
                    data = middleware.response(data)
                    this.count = data.count
                    let ds = data.results
                    if (this.$attrs.prepare) {
                        return this.$attrs.prepare(ds, this)
                    }
                    return ds
                }).then(data => {
                    this.loading = false
                    this.data = data
                    this.$emit("loaded", {data, count:this.count})
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
                let promise = Promise.resolve()
                let page = Math.ceil(this.count/this.maxPageSize)
                if(page>1) {
                    promise = this.$confirm(`此次导出记录数预计${this.count},超出最大限制${this.maxPageSize},基于网络性能考虑,程序会尝试分${page}页每次请求${this.maxPageSize}条记录的方式下载数据, 最终合并数据导出. 若期间后台数据有更新的话,则最终下载的数据可能会有重复或缺漏等风险,请注意检查.`,'分页导出提醒', {type:'warning', confirmButtonText:'好的,开始分页导出'})
                }
                let downloadFunc  = (page) => {
                    let d = Object.assign({}, this.queries, {page, page_size: this.maxPageSize})
                    return this.$http.get(`${this.url}?${Qs.stringify(d, {arrayFormat: 'comma'})}`).then(({data}) => {
                        return data.results
                    })
                }
                let allData = []
                return promise.then( () => {
                    this.loading = '正在获取数据'
                    return queueLimit(range(1, page+1),1,(p) => {
                        if(p>1){
                            this.loading = `第${p}页`
                        }
                        return downloadFunc(p).then(table => allData=allData.concat(table))
                    })
                }).then(() => {
                    this.loading = false
                    return allData
                }).catch(this.onServerResponseError)
            },
            onSortChange ({order, prop}) {
                this.updateQueries({ordering: (order == 'descending' ? '-' : '') + prop})
            }
        },
        computed: {
            tAttrs () {
                return {
                    excelGetAllData: this.excelGetAllData,
                    topActions: this.$attrs.topActions || ['refresh', 'download'],
                    avairableActions: this.avairableActions
                }
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

