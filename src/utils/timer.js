/**
 * Created by denishuang on 2020/1/7.
 */

export default function (options) {
    let t = {
        value: 0,
        ...options,
        init () {
            if (this.key) {
                this.value = Number.parseInt(localStorage.getItem(this.key) || 0)
            }
        },
        run () {
            this.handler = setInterval(() => {
                this.value++
                if (this.key && this.value % 10 === 0) {
                    localStorage.setItem(this.key, this.value)
                }
            }, 1000)
        },
        stop () {
            clearInterval(this.handler)
        },
        clear () {
            this.value = 0
            if (this.key) {
                localStorage.removeItem(this.key)
            }
        },
        toString () {
            let m = Math.floor(this.value / 60)
            let s = this.value % 60
            return `${m}'${s}''`
        }
    }
    t.init()
    t.run()
    return t
}
