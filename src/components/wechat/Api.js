/**
 * Created by denishuang on 2020/8/27.
 */

import $script from 'scriptjs'
import axios from '../../configs/axios'
var inited = false
export function init (options) {
    if (inited) {
        return
    }
    $script([
        'https://res.wx.qq.com/open/js/jweixin-1.6.0.js',
    ], () => {
        return axios.get(`/wechat/mp/jsapi/config/`).then(({data}) => {
            if (data.signature) {
                data.signature = data.signature.toLowerCase()
            }
            data.nonceStr = data.noncestr
            window.wx.config({
                debug: window.wx_debug,
                ...data,
                ...options
            })
            inited = true
        })
    })
}

export function dataURLtoFile (dataurl, filename) {
    var arr = dataurl.split(',')
    var mime = arr[0].match(/:(.*?);/)[1]
    var bstr = atob(arr[1])
    var n = bstr.length
    var u8arr = new Uint8Array(n)
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, {type: mime})
}

export default {
    init
}
