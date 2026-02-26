/**
 * Created by denishuang on 2020/2/8.
 */
import {throttle} from 'lodash'
import {$http} from '@/configs/axios'
import Qs from 'qs'
import {parseTime} from './filters'
let INTERVAL = 5
function DailyLog() {
    let a = {
        m: {},
        saveTime: undefined,
        delayMethods: {},
        async log (app, model, id, metics, subMetics, v, interval) {
            let k = `${app}.${model}.${id}.${metics}.${subMetics}`
            let dk = parseTime(new Date(), '{y}-{m}-{d}')
            let dm = this.m[dk] || {}
            let it = interval || INTERVAL
            dm[k] = v
            this.m[dk] = dm
            this.delayMethods[`save${it}s`]()
        },
        save () {
            return $http.post('/dailylog/dailylog/write/', this.m)
        },
        init () {
            for (var i = 1; i <= 3; i++) {
                let p = Math.pow(2, i - 1) * INTERVAL
                this.delayMethods[`save${p}s`] = throttle(() => this.save(), p * 1000)
            }
            return this
        }
    }
    return a.init()
}

export default DailyLog()
//     created () {

//         // console.log(this.delayMethods)
//     }
// })

export function Performance(app, model, ownerId, target, interval) {
    let qd = {app, model, owner_id: ownerId}
    return {
        data: {
            parts: [],
            dates: [],
            target,
            score: null,
            times: 0
        },
        post () {
            let d = {...qd, detail: this.data}
            return $http.post('/dailylog/performance/write/', d)
        },
        save: throttle(function () {
            this.post()
        }, interval || 10000),
        stack (s, v) {
            if (s[s.length - 1] !== v) {
                s.push(v)
            }
        },
        read () {
            return $http.get(`/dailylog/performance/read/?${Qs.stringify(qd)}`).then(({data}) => {
                Object.assign(this.data, data.detail, {target})
                return this.data
            })
        },
        addPart (p) {
            this.stack(this.data.parts, p)
            let d = parseTime(new Date(), '{y}-{m}-{d}')
            this.stack(this.data.dates, d)
            return this
        },
        addScore (score) {
            this.data.score = Math.max(this.data.score, score)
            return this
        },
        addTimes (times) {
            this.data.times += times
            return this
        }
    }
}

export function userOnlineTimeCounter(callBack) {
    let delta = 30
    let m = {metics: {online_time: delta}}
    function action () {
        $http.post(`/dailylog/user/count/`, m).then(({data}) => {
            callBack(data.detail)
        })
    }
    action()
    setInterval(action, delta * 1000)
}
