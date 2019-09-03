/**
 * Created by denishuang on 2019/9/3.
 */

import ModelForm from './Form.vue'
import ModelRelations from './Relations.vue'
import server_response from '../../mixins/server_response'
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
        this.$refs.form.$on("form-posted", this.redirectToEdit)
    },
    methods: {
        redirectToEdit(payLoad){
            let form = this.$refs.form
            let p = form.model.getDetailUrl()
            if (this.$route.params.id === 'create') {
                if (this.tab) {
                    this.tab.name = p
                }
                this.$router.replace(p)
            } else {
                this.setTitle(p)
            }
        },
        setTitle(p){
            this.tab.title = this.$refs.form.model.title()
        },
        destroy(){
            this.$store.state.bus.$emit("tab-destroy", this.tab.name)
        }
    },
    computed: {
    },
    watch: {

        data (val) {
            this.setTitle()
        },

    }
}
