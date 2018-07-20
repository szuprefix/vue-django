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
    mounted(){

        this.$refs.form.$on("form-posted", this.redirectToEdit)

    },
    methods: {
        redirectToEdit(payLoad){
            let form = this.$refs.form
            if (this.$route.params.id === 'create') {
                let p = form.modelDetailUrl
                this.tab.name = p
                this.$router.replace(p)
            } else {
                this.setTitle()
            }
        },
        setTitle(){
            this.tab.title = this.$refs.form.modelFormTitle
        },
        load(){
            return this.$refs.form.modelLoad()
        }
    },
    computed: {
        modelDetailUrl(){
            return this.$refs.form.modelDetailUrl
        }
    },
    watch: {

        modelData (val) {
            this.setTitle()
        },

    }
}