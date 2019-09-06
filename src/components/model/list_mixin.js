/**
 * Created by denishuang on 2019/9/3.
 */
import ModelTable from './Table.vue'
import server_response from '../../mixins/server_response'
export  default {
    props: {
        tab: Object
    },
    data () {
        return {
            data: []
        }
    },
    mixins: [server_response],
    components: {
        ModelTable
    },
    watch: {

        // data (val) {
        //     this.tab.title = this.$refs.table.modelTableTitle
        // },

    }
}