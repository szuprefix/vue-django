<template>
    <div v-if="isActive">
        <popup-radio title="画质" v-model="definition" :options="definitionOptions"></popup-radio>
        <!--<x-button @click.native="changeSrc(f)" v-for="f in files" :key="f.Definition">{{f.name}}</x-button>-->
    </div>
</template>
<script>
    import {XButton, PopupRadio} from 'vux'
    import {get} from 'lodash'
    import Cache from 'vue-django/src/utils/cache'
    export default{
        props: {
            options: Object
        },
        data () {
            return {
                definition: 20,
                breakPoint: 0,
                currentTime: 0,
                cache: Cache(`qcloud.vod.${this.fileId}.currentTime`)
            }
        },
        components: {XButton, PopupRadio},
        mounted () {
            if (this.isActive) {
                this.init()
            }
        },
        methods: {
            changeSrc (f) {
                let el = this.getEl()
                let ct = el.currentTime
                el.src = f.url
                el.play()
                this.breakPoint = ct
                this.setCurrentTime(ct)
            },
            init () {
                let ct = this.cache.read() || 0
                this.breakPoint = ct
//                this.setCurrentTime(ct)
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
                }
                this.cache.save(ct)
            },
            setCurrentTime (ct) {
                setTimeout(() => {
                    this.getEl().currentTime = ct
                }, 800)
            }
        },
        computed: {
            isWechat () {
                return (/MicroMessenger/i).test(window.navigator.userAgent)
            },
            isIPhone () {
                return (/iphone/i).test(window.navigator.userAgent)
            },
            fileId () {
                return this.options.FileId || this.options.FileId
            },
            files () {
                let dm = {
                    10: '流畅',
                    20: '标清',
                    30: '高清',
                    1100: '纯音频'
                }

                return get(this.options, 'TranscodeInfo.TranscodeSet', [])
                    .filter(a => [10, 20, 30, 1100].includes(a.Definition))
                    .map(a => {
                        return {definition: a.Definition, name: dm[a.Definition], url: a.Url}
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
            }
        }
    }
</script>
