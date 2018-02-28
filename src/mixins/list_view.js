/**
 * Created by denishuang on 2018/2/28.
 */
import Qs from 'qs'
import filters from '../utils/filters'
import server_response from './server_response'
export default{
    data () {
        return {
            url: null,
            queries: {},
            table: [],
            page: 1,
            count: 0
        }
    },
    mixins: [server_response],
    filters: filters,
    created () {
        this.loadData(this.page)
        this.$store.state.bus.$on('model-posted', this.onModelPosted)
    },
    beforeDestroy () {
        this.$store.state.bus.$off('model-posted', this.onModelPosted)
    },
    components: {},
    methods: {
        onModelPosted(payload){
//                if (payload.model === this.model || this.modelDependents.indexOf(payload.model) >= 0) {
            this.loadData()
//                }
        },
        loadData (page) {
            let d = this.queries
            d.page = page
            this.$http.get(`${this.url}?${Qs.stringify(d)}`).then(({data}) => {
                this.table = data.results
                this.count = data.count
                this.$emit("loaded", data)
            }).catch(this.onServerResponseError)
        },
        onRowClick (row, column, cell, event){
            this.$router.replace(`${row.id}`)
        },
        handleCurrentChange (val) {
            console.log(val)
            this.page = val
        }
    },
    computed: {},
    watch: {
        page(newVal, oldVal){
            this.loadData(newVal)
        }
    }
}