/**
 * Created by denishuang on 2018/4/23.
 */

import Qs from 'qs'
import filters from '../utils/filters'
import server_response from './server_response'
let DEFAULT_PAGE_SIZE = 20
export default{
    props: {
        tableBaseQueries: {
            type: Object,
            default: () => {
                return {}
            }
        },
        tablePageSize: {type: Number, default: () => DEFAULT_PAGE_SIZE},
    },
    data () {
        return {
            tableQueries: {page_size: this.tablePageSize, search: ''},
            tableData: [],
            tablePage: 1,
            tableCount: 0,
            tableUrl: "",
            // tableItems: [], // wayky modified : model_table mixin already define props
            tableSearchFields: []
        }
    },
    mixins: [server_response],
    modelTableFilters: filters,
    // mounted () {
    //     this.tableUpdateQueries({page: 1, page_size: this.pageSize, search: ''})
    //     // this.$store.state.bus.$on('model-posted', this.onModelPosted)
    //     // console.log(this.$store)
    // },
    components: {},
    methods: {

        tableUpdateQueries(d){
            this.tableQueries = Object.assign({}, this.tableBaseQueries, this.tableQueries, d)
        },
        tableLoad (queris) {
            let d = queris || this.tableQueries
            this.loading = true
            this.loadingText = '查询中'
            // console.log(this.tableUrl)
            return this.$http.get(`${this.tableUrl}?${Qs.stringify(d)}`).then(({data}) => {
                this.tableData = data.results
                this.tableCount = data.count
                this.loading = false
                // this.$emit("loaded", data)
            }).catch(this.onServerResponseError)
        },
        tableOnSearch(){
            this.tableUpdateQueries({page: 1})
        },
        tableOnPageChanged (val) {
            this.tablePage = val
        },
        tableOnPageSizeChanged (val){
            this.tablePageSize = val
        },
        tableDefaultWidget(f){

        }
    },
    computed: {

        tableSearchFieldNames () {
            return this.tableSearchFields.join(',')
        },
    },
    watch: {
        tablePage(newVal, oldVal){
            this.tableUpdateQueries({page: newVal})
        },
        tablePageSize(newVal, oldVal){
            this.tableUpdateQueries({page_size: newVal})
        },
        tableQueries(newVal, oldVal){
            this.tableLoad(newVal)
        }
    }
}
