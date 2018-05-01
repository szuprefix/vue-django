/**
 * Created by denishuang on 2018/4/23.
 */

import Qs from 'qs'
import filters from '../utils/filters'
import server_response from './server_response'
export default{
    props: {
        // tableItems: {
        //     type: Array,
        //     default: []
        // },
    },
    data () {
        return {
            tableQueries: {},
            tableData: [],
            tablePageSize: 20,
            tablePage: 1,
            tableCount: 0,
            tableUrl: "",
            tableItems: [],
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
            this.tableQueries = Object.assign({}, this.tableQueries, d)
        },
        tableLoad () {
            let d = this.tableQueries
            this.loading = '查询中'
            // console.log(this.tableUrl)
            this.$http.get(`${this.tableUrl}?${Qs.stringify(d)}`).then(({data}) => {
                this.tableData = data.results
                this.tableCount = data.count
                this.loading = false
                // this.$emit("loaded", data)
            }).catch(this.onServerResponseError)
        },
        tableOnSearch(){
            this.tableUpdateQueries({})
        },
        tableOnRowSelect(row, column, cell, event){
            this.tableToEditModel(row, column, cell, event)
        },
        tableToEditModel (row, column, cell, event){
            this.$router.replace(`${row.id}/`)
        },
        tableToCreateModel(){
            let url = `${this.modelListUrl}create/?${this.modelConfig.title_field}=${this.tableQueries.search}`
            console.log(url)
            this.$router.push(url)
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
            this.updateQueries({page: newVal})
        },
        tablePageSize(newVal, oldVal){
            this.updateQueries({page_size: newVal})
        },
        tableQueries(newVal, oldVal){
            this.tableLoad()
        }
    }
}