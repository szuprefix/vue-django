/**
 * Created by denishuang on 2017/11/29.
 */
import axios from '../configs/axios'
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
        title_field: config.title_field || 'name',
        listUrl: `${config.app}/${config.name}/`,
        config,
        errors: {},
        loadOptions(){
            if (config.rest_options) {
                return Promise.resolve(config.rest_options)
            }
            return axios.options(this.listUrl).then(({data}) => {
                 Object.assign( config, {rest_options: data})
                return data
            })
        },
        loadObject(id){
            return axios.get(`${this.listUrl}${id}/`).then(({data}) => {
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
                let config = Object.assign({app: a, name: m, fullName: `${a}.${m}`}, model)
                // let amodel = AppModel(config)
                cs[`${config.app}.${config.name}`] = config
            })
        })
    },
    get(fullName){
        return AppModel(this.getConfig(fullName))
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
