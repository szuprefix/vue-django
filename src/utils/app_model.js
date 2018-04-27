/**
 * Created by denishuang on 2017/11/29.
 */
import axios from '../configs/axios'
import store from '../store'
export function joinErrors(errors) {
    let es = {}
    for (let n in errors) {
        es[n] = errors[n].join("")
    }
    return es
}

export function AppModel(config) {
    return {
        name: config.name,
        fullName: `${config.app}.${config.name}`,
        verboseName: config.verbose_name,
        id: 'create',
        title_field: config.title_field || 'name',
        listUrl: `${config.app}/${config.name}/`,
        config,
        detailUrl(){
            return this.listUrl + this.id + '/'
        },
        errors: {},
        loadData () {
            if (!this.id) {
                return Promise.resolve({})
            } else {
                return axios.get(this.detailUrl()).then(({data}) => {
                    return data
                })
            }
        },
        loadFormConfig(){
            if (config.rest_options) {
                return Promise.resolve(config.rest_options)
            }
            return axios.options(this.listUrl).then(({data}) => {
                config = Object.assign({}, config, {rest_options: data})
                return data
            })
        },
        genEmptyDataFromRestOptions(m){
            let r = {}
            Object.keys(m).forEach((k) => {
                let f = m[k]
                r[k] = f.type === 'boolean' ? true : f.multiple ? [] : f.type === 'string' ? '' : null
            })
            return r
        },
        load() {
            return axios.all([this.loadData(), this.loadFormConfig()]).then(axios.spread((data, rest_options) => {
                if (!this.id) {
                    data = this.genEmptyDataFromRestOptions(rest_options.actions.POST)
                }
                this.data = data
                this.rest_options = rest_options
                return this
            }))
        },
        save(){
            let promise
            if (!this.id) {
                promise = axios.post(this.listUrl, this.data)
            } else {
                promise = axios.put(this.detailUrl(), this.data)
            }
            return promise.then(({data}) => {
                this.id = data.id
                this.data = data
                store.state.bus.$emit('model-posted', {model: this})
                return data
            })//.catch((error) => this.onErrors(error))
        },
        onErrors(error){
            if (error.code === 400) {
                this.errors = joinErrors(error.msg)
            }
            return Promise.reject(error)
        },
        getTitle(){
            return !this.id && `新增${this.verboseName}` || this.data['__str__'] || this.data[this.title_field]
        }
    }
}

export var Register = {
    configs: {},
    register(apps){
        let cs = this.configs
        Object.keys(apps).forEach((a) => {
            let app = apps[a]
            Object.keys(app.models).forEach((m) => {
                let model = app.models[m]
                let config = Object.assign({app: a, name: m, fullName:`${a}.${m}`}, model)
                // let amodel = AppModel(config)
                cs[`${config.app}.${config.name}`] = config
            })
        })
    },
    get(fullName){
        let config = this.configs[fullName]
        if (!config) {
            throw `model ${fullName} not found!`
        } else {
            return AppModel(config)
        }
    },
    getConfig(fullName){
        let config = this.configs[fullName]
        if (!config) {
            throw `model ${fullName} not found!`
        } else {
            return config
        }
    }
}
export default AppModel