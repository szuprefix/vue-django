<template>
    <div>
        <el-upload :http-request="uploadFile"
                   class="image-uploader"
                   ref="upload"
                   action="noaction"
                   accept=".jpg,.png,.jpeg,.gif"
                   :list-type="$attrs.listType || 'picture-card'"
                   v-bind="[$attrs, $props]"
                   :on-preview="onPreview"
                   :on-remove="onRemove"
                   :on-success="onSuccess"
                   :on-exceed="onExceed"
                   :on-error="onError">

            <i class="el-icon-plus"></i>
        </el-upload>

        <el-dialog :visible.sync="dialogVisible">
            <img width="100%" :src="dialogImageUrl" alt="">
        </el-dialog>
    </div>
</template>
<script>
    import {awsUpload, genFileName} from '../../../utils/upload'
    export default {
        model: {
            event: 'change'
        },
        props: {
            signUrl: String,
            fileName: String,
            context: Object,
            urls: Array
        },
        data () {
            return {
                fileList: this.urls.map(u => {
                    return {url: u}
                }),
                elUploader: undefined,
                dialogImageUrl: '',
                dialogVisible: false
            }
        },
        mounted () {
            this.elUploader = this.$el.querySelector('.el-upload')
            this.toggleAdd()
        },
        methods: {

            onPreview(file) {
                this.dialogImageUrl = file.url
                this.dialogVisible = true
            },
            onError(err, file, fileList){
                console.log(['error', err, file, fileList])
            },
            onSuccess(response, file, fileList){
                console.log('onSuccess', response, file, fileList)
                let sf = fileList.find(f => f.uid === file.uid)
                if (!sf) {
                    console.error('file not found:', file.uid)
                    return
                }
                sf.url = response.url
                this.$emit('success', {response, file, fileList, limit: this.$attrs.limit})
            },
            onRemove(file, fileList) {
                this.$emit('remove', {file, fileList})
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
            getFileNumber(fn) {
                let re = /(\d+)\./g
                let m = re.exec(fn)
                if (m) {
                    return m[1]
                }
            },
            uploadFile (req) {
                let file = req.file
                let fnt = this.fileName || '${md5}.${extName}'
                return genFileName(file, fnt).then(fname => {
                    return awsUpload(fname, file, {signUrl: this.signUrl})
                })
            }
        },
        computed: {},
        watch: {
            fileList (v) {
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
