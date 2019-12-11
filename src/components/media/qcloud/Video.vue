<template>
    <video class="player-size" preload="auto" playsinline webkit-playsinline>
    </video>

</template>
<script>
    import load from 'load.js'
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
            this.loadLib()
        },
        methods: {
            async loadLib() {
                if (!window.TCPlayer) {
                    await load.parallel([
                        '//imgcache.qq.com/open/qcloud/video/tcplayer/tcplayer.css',
                        '//imgcache.qq.com/open/qcloud/video/tcplayer/tcplayer.min.js',
                    ])
                    this.libLoaded = true
                }
                this.player = window.TCPlayer(this.$el, {
                    fileID: this.fileID,
                    appID: this.appID
                })
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
