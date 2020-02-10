/**
 * Created by denishuang on 2020/2/8.
 */
import Vue from 'vue'
import {throttle} from 'lodash'

let INTERVAL = 5
export default new Vue({
    data: {
        m: {},
        saveTime: undefined,
        delayMethods: {}
    },
    methods: {
        log (app, model, id, metics, subMetics, v, interval) {
            let k = `${app}.${model}.${id}.${metics}.${subMetics}`
            let d = new Date()
            let dk = d.toISOString().substr(0, 10)
            let dm = this.m[dk] || {}
            let it = interval || INTERVAL
            dm[k] = v
            this.m[dk] = dm
            this.delayMethods[`save${it}s`]()
        },
        save () {
            return this.$http.post('/dailylog/dailylog/write/', this.m)
        }
    },
    created () {
        for (var i = 1; i <= 3; i++) {
            let p = Math.pow(2, i - 1) * INTERVAL
            this.delayMethods[`save${p}s`] = throttle(this.save, p * 1000)
        }
        // console.log(this.delayMethods)
    }
})
