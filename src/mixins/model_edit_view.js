/**
 * Created by denishuang on 2018/4/25.
 */
import ModelForm from '../components/rest/ModelForm.vue'
import ModelTable from '../components/rest/ModelTable.vue'
import server_response from './server_response'
export  default {
    props: {
        tab: Object,
        id: [Number, String],
        default: () => {
            return {}
        },
        options: {
            type:Object,
            default: () => { return {}}
        }
    },
    data () {
        return {
            modelData: {}
        }
    },
    mixins: [server_response],
    components: {
        ModelForm, ModelTable
    },
    mounted(){
        this.$refs.form.$on("form-posted", this.redirectToEdit)
        this.$refs.form.$on("model-deleted", this.destroy)
    },
    methods: {
        redirectToEdit(payLoad){
            let form = this.$refs.form
            let p = form.modelDetailUrl
            if (this.$route.params.id === 'create') {
                if (this.tab) {
                    this.tab.name = p
                }
                const path = this.resolveRoutePath(p)
                this.$router.replace(path)
                //this.resolveCurrentTagLabel(path, `创建${form.modelFormTitle}`)
            } else {
                this.setTitle(p)
            }
        },
        setTitle(p){
            p = !!p ? p : this.resolveRoutePath(this.modelDetailUrl)

            const formTitle = this.$refs.form.modelFormTitle
            if (this.tab) {
                this.tab.title = formTitle
            } else {
                this.resolveCurrentTagLabel(p, formTitle)
            }
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
        },
        modelFormOptions(){
            return Object.assign({}, options && options.modelForm)
        }
    },
    watch: {

        modelData (val) {
            this.setTitle()
        },

    }
}
