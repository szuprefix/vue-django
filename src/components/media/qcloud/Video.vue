<template>
    <video class="vod-player player-size" :style="{width, height}"
           preload="auto" playsinline webkit-playsinline>
    </video>
</template>
<script>
    import $script from 'scriptjs'
    export default{
        props: {
            fileID: String,
            appID: String,
            width: String,
            height: String,
            fullScreen: false
        },
        data () {
            return {
                libLoaded: false,
                player: null
            }
        },
        components: {},
        mounted () {
//            console.log(this.fileID,this.appID)
            this.init()
        },
        beforeDestroy () {
            this.player.dispose()
            this.player = null
        },
        methods: {
            loadStyle (href) {
                var link = document.createElement('link')
                link.rel = 'stylesheet'
                link.type = 'text/css'
                link.href = href
                document.getElementsByTagName('head')[0].appendChild(link)
            },
            createPlayer () {
                this.player = window.TCPlayer(this.$el, this.playerOptions)
                let es = ['ended', 'pause', 'timeupdate', 'resolutionswitched']
                es.forEach(e => {
                    this.player.on(e, (a) => {
                        try {
                            this.$emit(e, a)
                        } catch (err) {
                        }
                    })
                })
//                if (this.fullScreen) {
//                    this.$nextTick(() => {
//                        this.player.requestFullscreen()
//                    })
//                }
            },
            init () {
                if (!window.TCPlayer) {
                    this.loadStyle('//imgcache.qq.com/open/qcloud/video/tcplayer/tcplayer.css')
                    $script([
                        '//imgcache.qq.com/open/qcloud/video/tcplayer/tcplayer.min.js',
//                        '//imgcache.qq.com/open/qcloud/video/tcplayer/lib/hls.min.0.8.8.js'
                    ], () => {
                        this.createPlayer()
                    })
                } else {
                    this.createPlayer()
                }
            },
            setCurrentTime (ct) {
                document.querySelector('video').currentTime = ct
            }
        },
        computed: {
            playerOptions () {
                return {
                    fileID: this.fileID,
                    appID: this.appID,
                    playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
                    plugins: {
                        ContinuePlay: { // 开启续播功能
                            auto: true
                        }
                    },
                    ...this.$attrs
                }
            }
        },
        watch: {
            fileID (v) {
                this.player.loadVideoByID(this.playerOptions)
            },
            fullScreen (v) {
                if (v) {
                    this.player.requestFullscreen()
                } else {
                    this.player.exitFullscreen()
                }
            }
        }
    }
</script>
<style>
    .tcplayer {
        margin: 0 auto;
    }

    /* 通过 css 设置播放器尺寸 这时<video>中的宽高属性将被覆盖*/
    .player-size {
        width: 640px;
        height: 360px;
    }

    @media screen and (max-width: 640px) {
        .player-size {
            width: 100%;
            height: 270px;
        }
    }

    /* 设置logo在高分屏的显示样式 */
    @media only screen and (min-device-pixel-ratio: 2), only screen and (-webkit-min-device-pixel-ratio: 2) {
        .tcp-logo-img {
            width: 50%;
        }
    }

</style>
