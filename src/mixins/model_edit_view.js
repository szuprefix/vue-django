/**
 * Created by denishuang on 2018/4/25.
 */
import ModelForm from '../components/rest/ModelForm.vue'
import server_response from './server_response'
export  default {
    props: {
        tab: Object,
        default: () => {
          return {}
        }
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
        this.$refs.form.$on("model-deleted", this.destroy)
    },
    methods: {
        redirectToEdit(payLoad){
            let form = this.$refs.form
            if (this.$route.params.id === 'create') {
                let p = form.modelDetailUrl
                if (this.tab) {
                  this.tab.name = p
                }
                this.$router.replace(this.resolveRoutePath(p))
            } else {
                this.setTitle()
            }
        },
        setTitle(){
          const formTitle = this.$refs.form.modelFormTitle
          if (this.tab) {
            this.tab.title = formTitle
          }
          this.$route.meta.title = formTitle
        },
        load(){
            return this.$refs.form.modelLoad()
        },
        destroy(){
            this.$store.state.bus.$emit("tab-destroy", this.tab.name)
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
