/**
 * Created by denishuang on 2018/2/28.
 */
import Qs from 'qs'
import filters from '../utils/filters'
import server_response from './server_response'
import {Register} from '../utils/app_model'
export default{
    props: {
        tab: Object
    },
    data () {
        return {
            url: null,
            queries: {},
            table: [],
            page: 1,
            pageSize: 20,
            count: 0,
            model: {},
            appModelName:null
        }
    },
    mixins: [server_response],
    filters: filters,
    created () {
        this.model = Register.get(this.appModelName)
        this.url = this.model.listUrl
        this.load(this.page)
        this.$store.state.bus.$on('model-posted', this.onModelPosted)
        // console.log(this.$store)
    },
    beforeDestroy () {
        this.$store.state.bus.$off('model-posted', this.onModelPosted)
    },
    components: {},
    methods: {
        onModelPosted({model}){
            if (model.fullName === this.model.fullName || this.model.dependents.indexOf(model.fullName) >= 0) {
                this.load()
            }
        },
        load (page) {
            let d = this.queries
            d.page = page
            d.page_size = this.pageSize
            this.$http.get(`${this.url}?${Qs.stringify(d)}`).then(({data}) => {
                this.table = data.results
                this.count = data.count
                this.$emit("loaded", data)
            }).catch(this.onServerResponseError)
        },
        toEditModel (row, column, cell, event){
            this.$router.replace(`${row.id}/`)
        },
        onPageChanged (val) {
            this.page = val
        }
    },
    computed: {},
    watch: {
        page(newVal, oldVal){
            this.load(newVal)
        }
    }
}