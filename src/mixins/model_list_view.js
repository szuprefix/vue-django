/**
 * Created by denishuang on 2018/4/25.
 */
import ModelTable from '../components/rest/ModelTable2.vue'
import server_response from './server_response'
export  default {
    props: {
        tab: Object
    },
    data () {
        return {
            modelList: [],
            modelConfig: {}
        }
    },
    mixins: [server_response],
    components: {
        ModelTable
    },
    watch: {

        modelList (val) {
            this.tab.title = this.$refs.table.modelTableTitle
        },

    }
}