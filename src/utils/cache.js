/**
 * Created by denishuang on 2020/2/11.
 */
import {throttle} from 'lodash'
export default function (key, interval) {
    function saveAtOnce (v) {
        localStorage.setItem(key, v)
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
