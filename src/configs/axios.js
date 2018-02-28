/**
 * Created by denishuang on 2017/7/28.
 */
import axios from 'axios'
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.headers['X-REQUESTED-WITH'] = 'XMLHttpRequest'
axios.defaults.baseURL = '/api/'
// axios.interceptors.request.use(function (config) {
//     // Do something before request is sent
//     return config;
// }, function (error) {
//     // Do something with request error
//     return Promise.reject(error);
// });
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
// axios.get('/auth/csrf_token/')
export default axios