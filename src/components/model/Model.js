/**
 * Created by denishuang on 2017/8/2.
 */
import {Register} from '../../utils/app_model'
import axios from '../../configs/axios'
import Qs from 'qs'
// import store from '../store'
export function joinErrors(errors) {
    let es = {}
    for (let n in errors) {
        es[n] = errors[n].join('')
    }
    return es
}

export default function (appModel, defaults, eventor) {
    let m = {
        appModel,
        defaults: defaults || {},
        eventor,
        config: {},
        id: null,
        fieldConfigs: {},
        options: {},
        errors: {},
        data: {},
        viewsConfig: undefined,

        init () {
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
        loadOptions () {
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
        cacheOptions (options) {
            this.options = Object.assign({}, this.options, options)
            this.fieldConfigs = Object.assign({}, this.fieldConfigs, options.actions.LIST, options.actions.POST)
            Object.keys(this.fieldConfigs).forEach((a) => {
                this.fieldConfigs[a].name = a
            })
        },
        emptyDataFromOptions (m) {
            let dvs = {}
            Object.assign(dvs, this.defaults)
            let r = {}
            Object.keys(m).forEach((k) => {
                let f = m[k]
                let v = dvs[f.name] || f.default
                if(v !== undefined){
                    r[k] = v
                } else if (f.type === 'boolean') {
                    r[k] = true
                } else if (f.multiple) {
                    r[k] = []
                }  else if ( f.type === 'string' ) {
                    r[k] = ''
                } else if ( f.type === 'nested object' ) {
                    r[k] = {}
                } else {
                    r[k] = null
                }
                // r[k] = v !== undefined ? v : (f.type === 'boolean' ? true : f.multiple ? [] : f.type === 'string' ? '' : null)
            })
            return r
        },
        fillEmptyDataFromOptions (r) {
            let m = this.fieldConfigs
            let dvs = {...this.defaults}
            Object.keys(m).forEach((k) => {
                if(!(k in r)) {
                    let f = m[k]
                    let v = dvs[f.name] || f.default
                    r[k] = v !== undefined ? v : (f.type === 'boolean' ? true : f.multiple ? [] : f.type === 'string' ? '' : null)
                }
            })
        },
        load () {
            return Promise.all([this.loadData(), this.loadOptions(), this.loadViewsConfig()]).then(rs => {
                let data = rs[0], restOptions=rs[1]
                if (!this.id) {
                    data = this.emptyDataFromOptions(restOptions.actions.POST)
                }
                this.data = Object.assign({}, this.data, data)
                return rs
            })
        },
        save (data) {
            let d = Object.assign({}, this.defaults, this.data, data)
            let promise
            if (!this.id) {
                promise = axios.post(this.getListUrl(), d)
            } else {
                promise = axios.patch(this.getDetailUrl(), d)
            }
            return promise.then(({data}) => {
                this.id = data.id
                this.data = Object.assign({}, this.data, data)
                this.emitPosted(this.id)
                return data
            }) // .catch((error) => this.onErrors(error))
        },
        doAction (action, data) {
            if (!this.id) {
                return axios.post(`${this.getListUrl()}${action}/`, data)
            } else {
                return axios.post(`${this.getDetailUrl()}${action}/`, data)
            }
        },
        selectOrCreate (d) {
            let url = this.getListUrl()
            return axios.get(`${url}?${Qs.stringify(d)}`).then(({data}) => {
                if (data.count === 1) {
                    return data.results[0]
                } else if (data.count === 0) {
                    return axios.post(url, d).then(({data}) => {
                        return data
                    })
                } else {
                    throw Error('记录不唯一')
                }
            })
        },
        removeRelateObject (rel, id) {
            this.data[rel] = this.data[rel].filter(a => a !== id)
            return this.save()
        },
        destroy (id) {
            id = id || this.id
            return axios.delete(this.getDetailUrl(id)).then(() => {
                this.eventor && this.eventor.$emit('model-deleted', {appModel: this.appModel, id})
            })
        },
        emitPosted (id) {
            this.eventor && this.eventor.$emit('model-posted', {appModel: this.appModel, id})
        },
        onErrors (error) {
            if (error.code === 400) {
                this.errors = joinErrors(error.msg)
            }
            return Promise.reject(error)
        },
        checkPermission (p, ps) {
            if (!ps) {
                return false
            }
            let pn = this.appModel.replace('.', `.${p}_`)
            return ps.includes(pn)
        },
        getListUrl () {
            return `/${this.appModel.replace('.', '/')}/`
        },
        getDetailUrl (id) {
            let mid = id || this.id
            return `${this.getListUrl()}${mid}/`
        },
        query (d, url) {
            if (!url) {
                url = this.getListUrl()
            }
            return axios.get(`${url}?${Qs.stringify(d, {arrayFormat: 'comma'})}`).then(({data}) => {
                return data
            })
        },
        title () {
            return (!this.id && `新增${this.config.verbose_name}`) || this.data['__str__']
        },
        loadViewsConfig () {
            if (this.viewsConfig) {
                return Promise.resolve(this.viewConfig)
            }
            return import(`@/views${this.getListUrl()}config.js`).then(m => {
                return m.default || {}
            }).catch((err) => {
                console.warn(`找不到视图配置@/views${this.getListUrl()}config.js,将使用默认配置, err: ${err}`)
                return {}
            }).then(config => {
                this.viewsConfig = config
                return config
            })
        },
        loadOptionsAndViewsConfig () {
            return Promise.all([this.loadOptions(), this.loadViewsConfig()])
        },
        parentMultipleRelationField (parent) {
            if (parent) {
                let pfs = Object.values(parent.fieldConfigs)
                let f = pfs.find(a => a.model === this.appModel)
                if (f && f.multiple === true) {
                    return f
                }
            }
            return null
        },
        getParentQueries(parent, pct_id) {
            let r = {}
            if (parent) {
                let f = this.parentMultipleRelationField(parent)
                if (f) {
                    let ids = parent.data[f.name]
                    r['id__in'] = ids.length > 0 && ids || [0]
                } else {
                    let am = parent.appModel
                    let pid = parent.id
                    let fs = Object.values(this.fieldConfigs)
                    let f = fs.find(a => a.model === am)
                    if (f && f.multiple !== true) {
                        r[f.name] = pid
                    } else {
                        let popt = this.options
                        if (popt.generic_foreign_key) {
                            let {ct_field, fk_field} = popt.generic_foreign_key
                            r[ct_field] = pct_id
                            if (!this.fieldConfigs[fk_field]) {
                                throw Error(`genric foreign key id_field:${fk_field} not found.`)
                            }
                            r[fk_field] = pid || undefined
                        }
                    }

                }
            }
            return r
        },
    }
    m.init()
    return m
}
