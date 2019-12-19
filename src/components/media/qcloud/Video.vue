<template>
    <video class="player-size" preload="auto" playsinline webkit-playsinline>
    </video>

</template>
<script>
    //    import load from 'load.js'
    import $script from 'scriptjs'
    export default{
        props: {
            fileID: String,
            appID: String
        },
        data () {
            return {
                libLoaded: false,
                player: null
            }
        },
        components: {},
        created () {
            this.init()
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
                this.player = window.TCPlayer(this.$el, {
                    fileID: this.fileID,
                    appID: this.appID
                })
            },
            init () {
                if (!window.TCPlayer) {
                    this.loadStyle('//imgcache.qq.com/open/qcloud/video/tcplayer/tcplayer.css')
                    $script('//imgcache.qq.com/open/qcloud/video/tcplayer/tcplayer.min.js', () => {
                        this.createPlayer()
                    })
                } else {
                    this.createPlayer()
                }
            }
        },
        computed: {}
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
