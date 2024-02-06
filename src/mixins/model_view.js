/**
 * Created by denishuang on 2017/8/2.
 */
import {Register} from '../utils/app_model'
import axios from '../configs/axios'
// import store from '../store'
export function joinErrors(errors) {
    let es = {}
    for (let n in errors) {
        es[n] = errors[n].join("")
    }
    return es
}

export default {
    props: {
        appModelName: String,
        modelDefaultValues: {
            type: Object, default: () => {
                return {}
            }
        }
    },
    data () {
        return {
            modelConfig: {},
            modelId: null,
            modelFieldConfigs: {},
            modelOptions: {},
            modelErrors: {},
            modelData: {}
        }
    },

    methods: {
        modelInit(){
            this.modelConfig = Register.getConfig(this.appModelName)
        },
        modelLoadData () {
            if (!this.modelId) {
                return Promise.resolve({})
            } else {
                return axios.get(this.modelDetailUrl).then(({data}) => {
                    return data
                })
            }
        },
        modelLoadOptions(){
            if (this.modelConfig.rest_options) {
                this.modelCacheOptions(this.modelConfig.rest_options)
                return Promise.resolve(this.modelConfig.rest_options)
            }
            return axios.options(this.modelListUrl).then(({data}) => {
                this.modelConfig.rest_options = data
                this.modelCacheOptions(this.modelConfig.rest_options)
                return data
            })
        },
        modelCacheOptions(options){
            this.modelOptions = Object.assign({}, this.modelOptions, options)
            this.modelFieldConfigs = Object.assign({}, this.modelFieldConfigs, options.actions.LIST, options.actions.POST)
            Object.keys(this.modelFieldConfigs).forEach((a) => {
                this.modelFieldConfigs[a].name = a
            })
        },
        modelEmptyDataFromOptions(m){
            let dvs = {}
            if (this.$route.query != null) {
                Object.assign(dvs, this.$route.query)
            }
            Object.assign(dvs, this.modelDefaultValues)
            let r = {}
            Object.keys(m).forEach((k) => {
                let f = m[k]
                let v = dvs[f.name]
                r[k] = v !== undefined ? v : ( f.type === 'boolean' ? true : f.multiple ? [] : f.type === 'string' ? '' : null )
            })
            return r
        },
        modelLoad() {
            return Promise.all([this.modelLoadData(), this.modelLoadOptions()]).then( rs => {
                let data=rs[0]
                let rest_options =rs[1]
                if (!this.modelId) {
                    data = this.modelEmptyDataFromOptions(rest_options.actions.POST)
                }
                this.modelData = Object.assign({}, this.modelData, data)
                return [data, rest_options]
            })
        },
        modelSave(data){
            let d = data || this.modelData
            let promise
            if (!this.modelId) {
                promise = axios.post(this.modelListUrl, d)
            } else {
                promise = axios.put(this.modelDetailUrl, d)
            }
            return promise.then(({data}) => {
                this.modelId = data.id
                this.modelData = Object.assign({}, this.modelData, data)
                this.modelEmitPosted()
                return data
            })//.catch((error) => this.onErrors(error))
        },
        modelDelete(id){
            return axios.delete(this.modelGetDetailUrl(id)).then(() => {
                this.$store.state.bus.$emit('model-deleted', {model: this.modelConfig})
            })
        },
        modelEmitPosted(){
            this.$store.state.bus.$emit('model-posted', {model: this.modelConfig})
        },
        onErrors(error){
            if (error.code === 400) {
                this.modelErrors = joinErrors(error.msg)
            }
            return Promise.reject(error)
        },
        modelGetDetailUrl(id){
            let mid = id || this.modelId
            return `${this.modelListUrl}${mid}/`
        },
        modelTitle(){
            return !this.modelId && `新增${this.modelConfig.verboseName}` || this.modelData['__str__']
        },
        modelCheckPermission(p){
            let ps = this.$store.state.user.permissions
            if (!ps) {
                return false
            }
            let pn = this.appModelName.replace('.', `.${p}_`)
            return ps.includes(pn)
        }
    },
    computed: {
        modelListUrl(){
            return `/${this.appModelName.replace(".", "/")}/`
        },
        modelDetailUrl(){
            return this.modelGetDetailUrl(this.modelId)
        }
    }
}
