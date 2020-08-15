<template>
    <div v-if="isActive">
        <div class="wechat_android_video_control">
            <span @click="showPopup = true">{{definitionMap[definition]}}</span>
            <span @click="togglePlaybackRate">{{playbackRate}}x</span>
        </div>
        <popup v-model="showPopup">
            <group title="画质">
                <radio v-model="definition" :fill-mode="false" :options="definitionOptions"
                       @on-change="showPopup = false"></radio>
            </group>
        </popup>
    </div>
</template>
<script>
    import {Popup, Radio, Group} from 'vux'
    import {get} from 'lodash'
    import {duration} from 'vue-django/src/utils/filters'
    export default{
        props: {
            options: Object,
            currentTime: {type: Number, default: 0}
        },
        data () {
            return {
                definition: 30,
                definitionMap: {
                    10: '流畅',
                    20: '标清',
                    30: '高清',
                    1100: '纯音频'
                },
                breakPoint: 0,
                playbackRate: 1,
                playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
                showPopup: false,
                cache: undefined
            }
        },
        components: {Popup, Radio, Group},
        mounted () {
            if (this.isActive) {
                this.init()
            }
        },
        methods: {
            changeSrc (f) {
                let el = this.getEl()
                let ct = el.currentTime
                ct = ct > 0 ? ct : this.breakPoint
                el.src = f.url
                el.play()
                this.breakPoint = ct
                this.setCurrentTime(ct)
            },
            togglePlaybackRate () {
                this.playbackRate = this.playbackRates.find(a => a > this.playbackRate) || this.playbackRates[0]
            },
            init () {
                this.breakPoint = this.currentTime
                this.getEl().addEventListener('timeupdate', this.onTimeUpdate)
            },
            getEl () {
                return document.querySelector('video')
            },
            onTimeUpdate () {
                let ct = this.getEl().currentTime
                if (this.breakPoint > 0 && ct > 0) {
                    ct = this.breakPoint
                    this.breakPoint = 0
                    this.getEl().currentTime = ct
                    this.$vux.toast.text(`从上次断点${duration(ct)}继续播放.`)
                }
            },
            setCurrentTime (ct) {
                setTimeout(() => {
                    this.getEl().currentTime = ct
                }, 800)
            }
        },
        computed: {
            isWechat () {
//                return true
                return (/MicroMessenger/i).test(window.navigator.userAgent)
            },
            isIPhone () {
                return (/iphone/i).test(window.navigator.userAgent)
            },
            fileId () {
                return this.options.FileId
            },
            files () {
                return get(this.options, 'TranscodeInfo.TranscodeSet', [])
                    .filter(a => [10, 20, 30, 1100].includes(a.Definition))
                    .map(a => {
                        return {definition: a.Definition, name: this.definitionMap[a.Definition], url: a.Url}
                    })
            },
            isActive () {
                return this.isWechat && !this.isIPhone
            },
            definitionOptions () {
                return this.files.map(a => {
                    return {key: a.definition, value: a.name}
                })
            }
        },
        watch: {
            definition (v) {
                this.changeSrc(this.files.find(a => a.definition === v))
            },
            playbackRate (v) {
                this.getEl().playbackRate = v
            }
        }
    }
</script>
<style>
    .wechat_android_video_control {
        background-color: darkgray;
        color: white;
        padding: 0.5rem;
    }

    .wechat_android_video_control span {
        padding: 0 1rem;
    }
</style>
