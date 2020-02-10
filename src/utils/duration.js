/**
 * Created by denishuang on 2020/2/8.
 */

export default function () {
    return {
        lastTime: undefined,
        ms: 0,
        run () {
            if (this.lastTime === undefined) {
                this.lastTime = new Date()
            }
            let dt = new Date()
            this.ms += dt - this.lastTime
            this.lastTime = dt
        },
        pause () {
            this.lastTime = undefined
        },
        clear () {
            this.ms = 0
        },
        getSeconds () {
            return Math.floor(this.ms / 1000)
        }
    }
}
