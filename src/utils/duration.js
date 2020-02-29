/**
 * Created by denishuang on 2020/2/8.
 */

export default function (key) {
    let ms = localStorage.getItem(key)
    ms = (ms && Math.floor(ms)) || 0
    console.debug(key, localStorage.getItem(key))
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
            if (key) {
                localStorage.setItem(key, ms)
            }
        },
        getSeconds () {
            return Math.floor(this.ms / 1000)
        }
    }
}
