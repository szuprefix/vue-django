/**
 * Created by denishuang on 2017/8/2.
 */
export default {
    props: {
        tab: Object
    },
    data () {
        return {
            model: null
        }
    },
    created (){
        this.model = this.$route.params.model
    },

    components: {
        ModelForm: require('../components/model/ModelForm.vue'),
        ModelDetail: require('../components/model/ModelDetail.vue'),
        ModelTable: require('../components/model/ModelTable.vue')
    },
    computed: {
        appName () {
            return this.model.split('.')[0]
        },
        modelName () {
            return this.model.split('.')[1]
        },
        modelConfig (){
            return this.$store.state.apps[this.appName].models[this.modelName]
        },
        modelVerboseName () {
            return this.modelConfig && this.modelConfig.verbose_name || null
        },
        modelDependents (){
            return this.modelConfig && this.modelConfig.dependents || []
        }
    },
}