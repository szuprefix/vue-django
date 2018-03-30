/**
 * Created by denishuang on 2018/3/4.
 */
import {Register} from '../utils/app_model'
import ModelForm from '../components/rest/ModelForm.vue'
import server_response from './server_response'
export  default {
    props: {
        tab: Object
    },
    data () {
        return {
            id: 'create',
            // data: {},
            model:{},
            rest_options: {}
        }
    },
    mixins:[server_response],
    created () {
        // console.log("this.appModelName "+this.appModelName)

        this.model = Register.get(this.appModelName)
        this.model.id = this.id = this.$route.params.id === 'create' ? undefined : this.$route.params.id
        // this.model.id = this.id === 'create' ? undefined : this.id
        this.load().catch(this.onServerResponseError)
    },
    components: {
        ModelForm
    },
    methods: {
        load (){
            this.loading = '加载中'
            return this.model.load().then((model) => {
                this.model = Object.assign({}, model)
                this.setTitle()
                this.loading = false
                this.$emit("model-loaded", this.model)
                return model
            })
        },
        formPosted ({model}) {
            if (!this.id) {
                let p = '/' + model.detailUrl()
                this.tab.name = p
                this.$router.replace(p)
            } else {
                this.setTitle()
            }
        },

        setTitle () {
            this.tab.title = this.model.getTitle()
        },

    }
}