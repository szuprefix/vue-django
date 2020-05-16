<template>
    <q-video :width="field.width" :height="field.height" :appID="$store.state.party.settings.media.qcloud.vod.appid" :fileID="fileId">
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
//            console.log(this.value)
        },
        components: {QVideo},
        methods: {},
        computed: {
            fileId () {
                let ct = this.value
                return ct.FileId || ct.fileId
            }
        }
    }
</script>
