/**
 * Created by denishuang on 2020/2/8.
 */
import {throttle} from 'lodash'
export default function (cache) {
    let ms = cache.read()
    ms = ms || 0
    // console.debug(key, localStorage.getItem(key))
    return {
        lastTime: undefined,
        ms: ms,
        run () {
            if (this.lastTime === undefined) {
                this.lastTime = new Date()
            }
            let dt = new Date()
            this.setMs(this.ms + (dt - this.lastTime))
            this.lastTime = dt
        },
        pause () {
            this.lastTime = undefined
        },
        clear () {
            this.setMs(0)
        },
        setMs (ms) {
            this.ms = ms
            this.saveCache()
        },
        saveCache: throttle(function () {
            cache.save(this.ms)
        }, 10000),
        getSeconds () {
            return Math.floor(this.ms / 1000)
        }
    }
}
