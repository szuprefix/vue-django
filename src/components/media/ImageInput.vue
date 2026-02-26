<template>
    <div>
        <image-urls-input v-if="limit>1" @new="addUrls" :plugin="field.plugin">
        </image-urls-input>
        <image-upload v-bind="[$attrs, $props, field]" :bucket="bucket"
                      :urls="imageUrls" @success="onSuccess" @remove="onRemove">
        </image-upload>
        <template v-if="limit === 1">
            <el-input v-model="context[field.name]" clearable placeholder="图片URL">
                <component :is="field.plugin" slot="append" v-if="field.plugin" @change="changeFileList"></component>
            </el-input>
        </template>

    </div>
</template>
<script>
    import ImageUpload from './ImageUpload.vue'
    // import ImageUpload from './qcloud/ImageUpload.vue'
    import ImageUrlsInput from './ImageUrlsInput.vue'
    import {template, get, uniq} from 'lodash'
    export default{
        props: {
            value: [String, Array],
            field: Object,
            context: Object
        },
        data () {
            return {
                urlToAdd: '',
                togglePlugin:false
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
            onRemove ({fileList, urls}) {
                this.changeFileList(urls)
            },
            changeFileList (urls) {
                console.log('changeFileList', urls)
                //let urls = fileList.map(f => f.url)
                this.$emit('input', this.limit === 1 ? (urls.length > 0 ? urls[0] : null) : urls)
            },
            addUrls(urls){
                console.log('new', urls, this.imageUrls)
                this.$emit('input', uniq(this.imageUrls.concat(urls)))
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
            },
            bucket () {
              let state= this.$store.state
              return get(state, 'party.settings.media.qcloud.cos.bucket') || get(state, 'qcloud.cos.bucket')
            }
        },
    }
</script>
