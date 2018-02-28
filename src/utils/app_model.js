/**
 * Created by denishuang on 2017/11/29.
 */
import axios from '../configs/axios'
import store from '../store'
function joinErrors(errors) {
    let es = {}
    for (let n in errors) {
        es[n] = errors[n].join("")
    }
    return es
}
export default function (name, verboseName, id) {
    return {
        name,
        verboseName,
        id,
        listUrl(){
            return this.name.replace('.', '/') + '/'
        },
        detailUrl(){
            return this.name.replace('.', '/') + '/' + this.id + '/'
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
            return axios.options(this.listUrl()).then(({data}) => {
                return data
            })
        },
        load() {
            return axios.all([this.loadData(), this.loadFormConfig()]).then(axios.spread((data, rest_options) => {
                this.data = data
                this.rest_options = rest_options
                return this
            }))
        },
        save(){
            let promise
            if (!this.id) {
                promise = axios.post(this.listUrl(), this.data)
            } else {
                promise = axios.put(this.detailUrl(), this.data)
            }
            return promise.then(({data}) => {
                this.id = data.id

                store.state.bus.$emit('model-posted', {model: this.name, data: data})
                return data
            })//.catch((error) => this.onErrors(error))
        },
        onErrors(error){
            if (error.code === 400) {
                this.errors = joinErrors(error.msg)
            }
            return Promise.reject(error)
        }
    }
}