/**
 * Created by denishuang on 2019/9/3.
 */

import ModelForm from '../../components/model/Form.vue'
import ModelRelations from '../../components/model/Relations.vue'
import server_response from '../server_response'
export  default {
    props: {
        tab: Object,
        id: [Number, String],
    },
    data () {
        return {
            data: {}
        }
    },
    mixins: [server_response],
    components: {
        ModelForm, ModelRelations
    },
    mounted(){
        this.$refs.form.$on("form-posted", this.onFormPosted)
        this.$store.state.bus.$on('model-deleted', this.onModelDeleted)
    },
    beforeDestroy () {
        this.$store.state.bus.$off('model-deleted', this.onModelDeleted)
    },
    methods: {
        onFormPosted ({ intent}){
            this.setTitle ()
            console.log(intent, this.$route.params.id)
            if (intent === 'save' && this.$route.params.id === 'create') {
                this.redirectToEdit()
            }
            if (intent === 'saveAndAnother' && this.$route.params.id !== 'create') {
                this.redirectToEdit('create')
            }
        },
        redirectToEdit(id){

            let form = this.$refs.form
            let p = form.model.getDetailUrl(id)
            if (this.tab) {
                this.tab.name = p
            }
            this.$router.replace(p)
        },
        onModelDeleted ({appModel, id}) {
            let m = this.$refs.form.model
            if (appModel === m.appModel && id === m.id) {
                this.destroy()
            }
        },
        setTitle(p){
            this.tab.title = this.$refs.form.model.title()
        },
        destroy(){
            this.$store.state.bus.$emit("tab-destroy", this.tab.name)
        }
    },
    computed: {},
    watch: {

        data (val) {
            this.setTitle()
        },

    }
}
