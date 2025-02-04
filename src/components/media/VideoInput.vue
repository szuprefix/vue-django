<template>
    <div>
        <q-video v-bind="[field]" :appID="appid" :fileID="fileId">
        </q-video>
        <el-button>重新上传</el-button>
    </div>
</template>
<script>
    import QVideo from './qcloud/Video.vue'
    export default{
        props: {
            value: Object,
            field: Object,
            context: Object
        },
        data () {
            return {}
        },
        created () {
//            console.log(this.value)
        },
        components: {QVideo},
        methods: {
            save ({response, file, fileList}) {
                this.$emit('input', response)
//                let name = path.basename(file.name, path.extname(file.name))
//                let md = {
//                    context: response,
//                    url: response.video.url,
//                    lecturer: this.lecturer,
//                    name
//                }
            }
        },
        computed: {
            fileId () {
                let ct = this.value
                return ct.FileId || ct.fileId
            },
            appid () {
              return this.value.appid || this.$store.state.party.settings.media.qcloud.vod.appid
            }
        }
    }
</script>
