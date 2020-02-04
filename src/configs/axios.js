/**
 * Created by denishuang on 2017/7/28.
 */
import axios from 'axios'
import Cookies from 'js-cookie'

import Vue from 'vue'

function genBaseUrl (tpl) {
    let a =tpl
    location.pathname.split('/').forEach( (s, i) => {
        a = a.replace('$' +i, s)
    })
    if(a.startsWith('//')) {
        a=a.slice(1)
    }
    return a
}

axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.headers['X-REQUESTED-WITH'] = 'XMLHttpRequest'

axios.interceptors.response.use(function (response) {
    return response;
}, function (error) {
    if (error.response) {
        return Promise.reject({code: error.response.status, msg: error.response.data})
    } else {
        return Promise.reject({code: '-1', msg: error.message})
    }
})

Vue.prototype.$http = Vue.http = axios

if (!Cookies.get('csrftoken')) {
    axios.get('/csrf_token/')
}

axios.setBaseURL = (url) => {
    axios.defaults.baseURL = genBaseUrl(url)
}

export default axios
