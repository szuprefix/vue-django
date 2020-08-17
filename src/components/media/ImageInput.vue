<template>
    <image-upload v-bind="[$attrs, $pros, field]" :context="context" :bucket="bucket"
                  :urls="imageUrls" @success="onSuccess" @remove="onRemove">
    </image-upload>
</template>
<script>
    import ImageUpload from './qcloud/ImageUpload.vue'
    import {template, get} from 'lodash'
    export default{
        props: {
            value: [String, Array],
            field: Object,
            context: Object
        },
        data () {
            return {
//                fileName: undefined
            }
        },
        created () {
            console.log(this.bucket)
        },
        components: {ImageUpload},
        methods: {
            onSuccess({fileList}) {

                this.changeFileList(fileList)
            },
            onRemove ({fileList}) {
                this.changeFileList(fileList)
            },
            changeFileList (fileList) {
                let limit = this.$attrs.limit || this.field.limit
                let urls = fileList.map(f => f.url)
                this.$emit('input', limit === 1 ? (urls.length > 0 ? urls[0] : null) : urls)
            }
        },
        computed: {
            imageUrls () {
                let v = this.value
                if (!v) {
                    return []
                }
                if (typeof v === 'string') {
                    return [v]
                }
                return v
            },
            bucket () {
                let state= this.$store.state
                return get(state, 'party.settings.media.qcloud.cos.bucket') || get(state, 'qcloud.cos.bucket')
            }
        }
    }
</script>
