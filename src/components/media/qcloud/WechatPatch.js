/**
 * Created by denishuang on 2020/2/11.
 */

export default function (cache) {
    return {
        cache,
        isWechat () {
            return window.navigator.userAgent.toLowerCase().match(/MicroMessenger/i) === 'micromessenger'
        },
        cacheCurrentTime () {
            this.cache.save()
        }
    }
}
