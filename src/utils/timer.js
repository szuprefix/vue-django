/**
 * Created by denishuang on 2020/1/7.
 */

import {duration} from './filters'
import {throttle} from 'lodash'
export default function (cache) {
    let t = {
        value: 0,
        cache,
        init () {
            if (this.cache) {
                this.value = this.cache.read() || 0
            }
        },
        run () {
            this.handler = setInterval(() => {
                this.value++
                if (this.cache) {
                    this.saveCache()
                }
            }, 1000)
        },
        saveCache: throttle(function () {
            this.cache.save(this.value)
        }, 10000),
        stop () {
            clearInterval(this.handler)
        },
        clear () {
            this.value = 0
            if (this.cache) {
                this.cache.destroy()
            }
        },
        toString () {
            return duration(this.value)
        }
    }
    t.init()
    t.run()
    return t
}
