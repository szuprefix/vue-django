/**
 * Created by denishuang on 2017/7/28.
 */
import axios from 'axios'
import Cookies from 'js-cookie'

import Vue from 'vue'

let instance = axios.create()

// function genBaseUrl (tpl) {
//     let a = tpl
//     location.pathname.split('/').forEach((s, i) => {
//         a = a.replace('$' + i, s)
//     })
//     if (a.startsWith('//')) {
//         a = a.slice(1)
//     }
//     return a
// }

instance.defaults.xsrfCookieName = 'csrftoken'
instance.defaults.xsrfHeaderName = 'X-CSRFToken'
instance.defaults.headers['X-REQUESTED-WITH'] = 'XMLHttpRequest'

instance.interceptors.response.use(function (response) {
    return response
}, function (error) {
    if (error.response) {
        return Promise.reject({code: error.response.status, msg: error.response.data})
    } else {
        return Promise.reject({code: '-1', msg: error.message})
    }
})

Vue.prototype.$http = Vue.http = instance

instance.setBaseURL = (url) => {
    // instance.defaults.baseURL = genBaseUrl(url)
    let p = location.pathname.split(/\/(mobile|dashboard)\//g)[0]
    if (['/', ''].includes(p)) {
        instance.defaults.baseURL = url
    } else {
        instance.defaults.baseURL = `${p}${url}`
    }

    if (!Cookies.get(instance.defaults.xsrfCookieName)) {
        instance.get('/csrf_token/')
    }
}
instance.setAuthToken = (token) => {
    instance.defaults.headers['Authorization'] = `Token ${token}`
}
export default instance
