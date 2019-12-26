/**
 * Created by denishuang on 2019/9/3.
 */
import ModelTable from '../../components/model/Table.vue'
import ModelGrid from '../../components/model/Grid.vue'
import server_response from '../server_response'
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
        ModelTable, ModelGrid
    },
    watch: {

        // data (val) {
        //     this.tab.title = this.$refs.table.modelTableTitle
        // },

    }
}