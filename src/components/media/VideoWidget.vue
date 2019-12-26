<template>
    <q-video :width="field.width" :height="field.height" :appID="$store.state.qcloud.vod.appId"
             :fileID="value[field.name].fileId" ref="video">
    </q-video>
</template>
<script>
    import QVideo from './qcloud/Video.vue'
    export default{
        props: {
            value: Object,
            field: Object
        },
        data () {
            return {}
        },
        created () {
//            console.log(this.value[this.field.name])
        },
        components: {QVideo},
        methods: {},
        computed: {},
        watch: {
            value(v) {
                this.$refs.video.createPlayer()
                console.log('change', v)
            }
        }
    }
</script>
