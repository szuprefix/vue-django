<template>
    <div>
        <el-upload :http-request="uploadFile"
                   class="image-uploader"
                   ref="upload"
                   action="noaction"
                   accept=".jpg,.png,.jpeg,.gif,.webp"
                   :list-type="$attrs.listType || 'picture-card'"
                   :file-list="fileList"
                   v-bind="[$attrs, $props]"
                   :on-preview="onPreview"
                   :on-remove="onRemove"
                   :on-change="onChange"
                   :on-progress="onProgress"
                   :on-success="onSuccess"
                   :on-exceed="onExceed"
                   :on-error="onError">
            <slot>
                <i class="el-icon-plus"></i>
            </slot>
        </el-upload>

        <el-dialog :visible.sync="dialogVisible">
            <img width="100%" :src="dialogImageUrl" alt="">
        </el-dialog>
    </div>
</template>
<script>
    import {template} from 'lodash'
    import {upload} from '../../utils/upload'
    export default {
        model: {
            event: 'change'
        },
        props: {
            context: Object,
            urls: Array
        },
        data () {
            return {
                fileList: [],
                elUploader: undefined,
                dialogImageUrl: '',
                dialogVisible: false
            }
        },
        mounted () {
            this.genFileList()
            this.elUploader = this.$el.querySelector('.el-upload')
            this.toggleAdd()
        },
        methods: {
            genFileList() {
                this.fileList = this.urls.map(u => {
                    return {url: u}
                })
            },
            onPreview(file) {
                this.dialogImageUrl = file.url
                this.dialogVisible = true
            },
            onProgress(event, file, fileList){
//                console.log(['progress', event, file, fileList])
            },
            onError(err, file, fileList){
                console.log(['error', err, file, fileList])
            },
            onSuccess(response, file, fileList){
                let sf = fileList.find(f => f.uid === file.uid)
                if (!sf) {
                    console.error('file not found:', file.uid)
                    return
                }
                sf.url = response.url
                this.$emit('success', {response, file, fileList, limit: this.$attrs.limit})
            },
            onRemove(file, fileList) {
                this.fileList = fileList
                this.$emit('remove', {file, fileList})
            },
            onChange (file, fileList) {
                this.fileList = fileList
            },
            toggleAdd () {
                if (this.$attrs.limit === 1) {
                    if (this.fileList.length > 0) {
                        this.elUploader.classList.add('hidden')
                    } else {
                        this.elUploader.classList.remove('hidden')
                    }
                }
            },
            onExceed(files, fileList) {
                this.$message({message: '超出文件数限制.', type: 'error'})
            },
            toUrl(file) {
                var URL = window.URL || window.webkitURL
                let url = URL.createObjectURL(file)
                return url
            },
            uploadFile (req) {
                let file = req.file
                let options = {...this.$store.state.imageUploadOptions, ...this.context}
                return upload(file, options)
            }
        },
        watch: {
            fileList (v) {
//                this.$emit('change', v.map(a => a.url))
                this.toggleAdd()
            },
            urls (v) {
                this.fileList = this.urls.map(u => {
                    return {url: u}
                })
            }
        }
    }
</script>
<style>
    .el-upload.hidden {
        display: none;
    }
</style>
