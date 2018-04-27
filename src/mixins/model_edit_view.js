/**
 * Created by denishuang on 2018/4/25.
 */
import ModelForm from '../components/rest/ModelForm2.vue'
import server_response from './server_response'
export  default {
    props: {
        tab: Object
    },
    data () {
        return {
            modelData: {}
        }
    },
    mixins: [server_response],
    components: {
        ModelForm
    },
    computed: {
        modelDetailUrl(){
            return this.$refs.form.modelDetailUrl
        }
    },
    watch: {

        modelData (val) {
            this.tab.title = this.$refs.form.modelFormTitle
        },

    }
}