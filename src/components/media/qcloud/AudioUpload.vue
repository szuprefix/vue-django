<template>
    <div>
        <el-upload :http-request="uploadFile"
                   class="audio-uploader"
                   ref="upload"
                   action="noaction"
                   accept=".mp3"
                   :file-list="fileList"
                   v-bind="[$attrs, $props]"
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
    </div>
</template>
<script>
    import {format} from 'date-fns'
    import {template} from 'lodash'
    import {qcloudUpload} from '../upload'
    export default {
        model: {
            event: 'change'
        },
        props: {
            signUrl: String,
            fileName: String,
            context: Object,
            bucket: String,
            region: {type: String, default: 'ap-guangzhou'},
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
            getAuthorization (options, callback) {
                let signUrl = template(this.signUrl)(this.context)
                return this.$http.post(signUrl).then(({data}) => {
                    let d = {
                        TmpSecretId: data.credentials.tmpSecretId,
                        TmpSecretKey: data.credentials.tmpSecretKey,
                        XCosSecurityToken: data.credentials.sessionToken,
                        // 建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
                        StartTime: data.startTime, // 单位是秒
                        ExpiredTime: data.expiredTime, // SDK 在 ExpiredTime 时间前，不会再次调用 getAuthorization
                    }
//                    console.debug(d)
                    callback(d)
                })
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
                sf.url = `https://${response.Location}`
                this.$emit('success', {response, file, fileList, limit: this.$attrs.limit})
            },
            onRemove(file, fileList) {
                this.fileList = fileList
                this.$emit('remove', {file, fileList})
            },
            onChange (file, fileList) {
//                console.log('change')
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
                return qcloudUpload(
                    req,
                    this.getAuthorization, {
                        Bucket: this.bucket, /* 必须 */
                        Region: this.region
                    }, this.context,
                    this.fileName
                )
            }
        },
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