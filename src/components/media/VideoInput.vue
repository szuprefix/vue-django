<template>
    <q-video :width="field.width" :height="field.height" :appID="$store.state.qcloud.vod.appId" :fileID="value.fileId">
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
        computed: {}
    }
</script>
