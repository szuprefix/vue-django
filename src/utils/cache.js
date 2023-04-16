/**
 * Created by denishuang on 2020/2/11.
 */
import {throttle} from 'lodash'
export default function (key, interval) {
    function saveAtOnce (v) {
        try {
            localStorage.setItem(key, v)
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                console.warn('超出本地存储限额！')
                // 如果历史信息不重要了，可清空后再设置
                localStorage.clear()
                localStorage.setItem(key, v)
            }
        }
    }

    let save = throttle(saveAtOnce, interval || 1000)

    function destroy () {
        localStorage.removeItem(key)
    }

    function read () {
        return localStorage.getItem(key)
    }

    return {
        save,
        read,
        saveAtOnce,
        destroy
    }
}

export function RouterMemory(router) {

    return {
        getKey(k) {
            return `${router.currentRoute}:${k}`
        },
        read(key) {
            localStorage.getItem(this.getKey(key))
        }
    }
}
