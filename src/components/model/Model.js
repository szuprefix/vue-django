/**
 * Created by denishuang on 2017/8/2.
 */
import {Register} from '../../utils/app_model'
import axios from '../../configs/axios'
// import store from '../store'
export function joinErrors(errors) {
    let es = {}
    for (let n in errors) {
        es[n] = errors[n].join("")
    }
    return es
}

export default function (appModel, defaults, eventor) {
    let m = {
        appModel,
        defaults: defaults || {},
        eventor: eventor || function () {
        },
        config: {},
        id: null,
        fieldConfigs: {},
        options: {},
        errors: {},
        data: {},

        init(){
            this.config = Register.getConfig(this.appModel)
        },
        clear () {
            Object.assign(this.data, this.emptyDataFromOptions(this.fieldConfigs))
            this.id = null
            this.errors = {}
        },
        loadData () {
            if (!this.id) {
                return Promise.resolve({})
            } else {
                return axios.get(this.getDetailUrl()).then(({data}) => {
                    this.id = data.id
                    return data
                })
            }
        },
        loadOptions(){
            if (this.config.rest_options) {
                this.cacheOptions(this.config.rest_options)
                return Promise.resolve(this.config.rest_options)
            }
            return axios.options(this.getListUrl()).then(({data}) => {
                this.config.rest_options = data
                this.cacheOptions(this.config.rest_options)
                return data
            })
        },
        cacheOptions(options){
            this.options = Object.assign({}, this.options, options)
            this.fieldConfigs = Object.assign({}, this.fieldConfigs, options.actions.LIST, options.actions.POST)
            Object.keys(this.fieldConfigs).forEach((a) => {
                this.fieldConfigs[a].name = a
            })
        },
        emptyDataFromOptions(m){
            let dvs = {}
            Object.assign(dvs, this.defaults)
            let r = {}
            Object.keys(m).forEach((k) => {
                let f = m[k]
                let v = dvs[f.name]
                r[k] = v !== undefined ? v : ( f.type === 'boolean' ? true : f.multiple ? [] : f.type === 'string' ? '' : null )
            })
            return r
        },
        load() {
            return axios.all([this.loadData(), this.loadOptions()]).then(axios.spread((data, rest_options) => {
                if (!this.id) {
                    data = this.emptyDataFromOptions(rest_options.actions.POST)
                }
                this.data = Object.assign({}, this.data, data)
                return [data, rest_options]
            }))
        },
        save(data){
            let d = Object.assign({}, this.defaults, this.data, data)
            let promise
            if (!this.id) {
                promise = axios.post(this.getListUrl(), d)
            } else {
                promise = axios.put(this.getDetailUrl(), d)
            }
            return promise.then(({data}) => {
                this.id = data.id
                this.data = Object.assign({}, this.data, data)
                this.emitPosted(this.id)
                return data
            })//.catch((error) => this.onErrors(error))
        },
        destroy(id){
            id = id || this.id
            return axios.delete(this.getDetailUrl(id)).then(() => {
                this.eventor.$emit('model-deleted', {appModel: this.appModel, id})
            })
        },
        emitPosted(id){
            this.eventor.$emit('model-posted', {appModel: this.appModel, id})
        },
        onErrors(error){
            if (error.code === 400) {
                this.errors = joinErrors(error.msg)
            }
            return Promise.reject(error)
        },
        checkPermission(p, ps){
            if (!ps) {
                return false
            }
            let pn = this.appModel.replace('.', `.${p}_`)
            return ps.includes(pn)
        },
        getListUrl(){
            return `/${this.appModel.replace(".", "/")}/`
        },
        getDetailUrl(id){
            let mid = id || this.id
            return `${this.getListUrl()}${mid}/`
        },
        title(){
            return !this.id && `新增${this.config.verbose_name}` || this.data['__str__']
        },
    }
    m.init()
    return m
}
