/**
 * Created by denishuang on 2017/7/28.
 */
import axios from 'axios'
import Cookies from 'js-cookie'

axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.headers['X-REQUESTED-WITH'] = 'XMLHttpRequest'
axios.defaults.baseURL = '/api/'

axios.interceptors.response.use(function (response) {
    return response;
}, function (error) {
    if (error.response) {
        return Promise.reject({code: error.response.status, msg: error.response.data})
    } else {
        return Promise.reject({code: '-1', msg: error.message})
    }
})

import Vue from 'vue'
Vue.prototype.$http = Vue.http = axios

if (!Cookies.get('csrftoken')) {
    axios.get('/csrf_token/')
}

export default axios
