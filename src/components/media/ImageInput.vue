<template>
    <div>
        <image-urls-input v-if="limit>1" @new="addUrls">
        </image-urls-input>
        <image-upload v-bind="[$attrs, $props, field]" :context="field.options"
                      :urls="imageUrls" @success="onSuccess" @remove="onRemove">
        </image-upload>
        <el-input v-if="limit === 1" v-model="context[field.name]"></el-input>
    </div>
</template>
<script>
    import ImageUpload from './ImageUpload.vue'
    import ImageUrlsInput from './ImageUrlsInput.vue'
    import {template, get} from 'lodash'
    export default{
        props: {
            value: [String, Array],
            field: Object,
            context: Object
        },
        data () {
            return {
                urlToAdd: ''
//                fileName: undefined
            }
        },
        created () {
//            console.log(this.context)
        },
        components: {ImageUpload, ImageUrlsInput},
        methods: {
            onSuccess({fileList, urls}) {
                this.changeFileList(urls)
                if (this.field.onSuccess) {
                    this.field.onSuccess({fileList, urls, ...this.$props})
                }
            },
            onRemove ({fileList}) {
                this.changeFileList(fileList)
            },
            changeFileList (urls) {
                //let urls = fileList.map(f => f.url)
                this.$emit('input', this.limit === 1 ? (urls.length > 0 ? urls[0] : null) : urls)
            },
            addUrls(urls){
                console.log('new', urls)
                this.$emit('input', this.imageUrls.concat(urls))
            }
        },
        computed: {
            limit () {
                return this.$attrs.limit || this.field.limit
            },
            imageUrls () {
                let v = this.value
                if (!v) {
                    return []
                }
                if (typeof v === 'string') {
                    return [v]
                }
                return v
            }
        },
    }
</script>
