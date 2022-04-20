<template>
    <div>
        <el-upload :http-request="uploadFiles"
                   class="upload-demo"
                   ref="upload"
                   action="noaction"
                   accept=".mp4,.avi,.mov,.png,.jpg"
                   multiple="multiple"
                   :on-preview="handlePreview"
                   :on-remove="handleRemove"
                   :on-change="onChange"
                   :on-progress="onProgress"
                   :on-success="onSuccess"
                   :on-error="onError"
                   list-type="file">
            <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
            <!--<el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>-->
            <div slot="tip" class="el-upload__tip">
                <p>只能上传mp4/mov/avi文件.</p>

            </div>

        </el-upload>
    </div>
</template>
<script>
    import * as tus from "tus-js-client"
    export default{
        data () {
            return {
                fileList: [],
                previewFile: undefined,
                dialogVisible: false
            }
        },
        components: {},
        methods: {
            handleRemove(file, fileList) {
//                console.log(file, fileList);
            },
            handlePreview(file) {
                this.previewFile = file
                this.dialogVisible = true
            },
            onProgress(event, file, fileList){
                file.percentage = event.percentage
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
                file.url = file.raw.url
                console.log(['success', response, file, fileList])
                this.$emit('success', {response, file, fileList})
            },
            onChange (file, fileList) {
                this.fileList = fileList
            },
            uploadFiles (req) {
                let file = req.file
                return new Promise((resolve, reject) => {
                    var upload = new tus.Upload(file, {
                        endpoint: this.$store.state.tus.endpoint,
                        retryDelays: [0, 3000, 5000, 10000, 20000],
                        metadata: {
                            filename: file.name,
                            filetype: file.type
                        },
                        onError  (error) {
                            console.log("Failed because: " + error)
                            reject(req)
                        },
                        onProgress  (bytesUploaded, bytesTotal) {
                            var percentage = bytesUploaded / bytesTotal
                            console.log(req)
                            req.onProgress({bytesUploaded, bytesTotal, percentage})
                        },
                        onSuccess () {
                        },
                        onAfterResponse (request, res) {
                            let mid = res.getHeader("stream-media-id")
                            if (mid) {
                                file.url = `https://iframe.videodelivery.net/${mid}`
                            }
                            resolve(res)
                        },
                    })
                    upload.findPreviousUploads().then(function (previousUploads) {
                        // Found previous uploads so we select the first one.
                        if (previousUploads.length) {
                            upload.resumeFromPreviousUpload(previousUploads[0])
                        }

                        // Start the upload
                        upload.start()
                    })
                })
            }
        },
        computed: {}
    }
</script>
