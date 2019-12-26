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
                <p>视频上传成功后, 因为后台转码需要一段时间, 如果马上在播放器上播放, 有可能会提示"没有找到视频转码信息. Error Code: 13", 请稍等一段时间再刷新页面看看.</p>
            </div>
            <!--<i slot="default" class="el-icon-plus"></i>-->
            <!--<div slot="file" slot-scope="{file}">-->
            <!--<video style="width:100%;height:100%;" controls="controls" :src="file.url || toUrl(file.raw)"-->
            <!--v-if="file.raw.type.includes('video')"></video>-->
            <!--<el-image :src="file.url || toUrl(file.raw)" style="width:100%;height:100%;" fit="cover"-->
            <!--v-else-if="file.raw.type.includes('image')"></el-image>-->
            <!--<span class="el-upload-list__item-actions">-->
            <!--<span class="el-upload-list__item-preview" @click="handlePreview(file)">-->
            <!--<i class="el-icon-zoom-in"></i>-->
            <!--</span>-->
            <!--<span v-if="!disabled" class="el-upload-list__item-delete" @click="handleDownload(file)">-->
            <!--<i class="el-icon-download"></i>-->
            <!--</span>-->
            <!--<span v-if="!disabled" class="el-upload-list__item-delete" @click="handleRemove(file)">-->
            <!--<i class="el-icon-delete"></i>-->
            <!--</span>-->
            <!--</span>-->
            <!--</div>-->

        </el-upload>
        <!--<el-dialog :visible.sync="dialogVisible">-->
        <!--<video style="width:100%;height:100%;" controls="controls" :src="previewFile.url || toUrl(previewFile.raw)"-->
        <!--v-if="previewFile && previewFile.raw.type.includes('video')"></video>-->
        <!--<el-image :src="previewFile.url || toUrl(previewFile.raw)"-->
        <!--v-else-if="previewFile && previewFile.raw.type.includes('image')"></el-image>-->
        <!--</el-dialog>-->
    </div>
</template>
<script>
    import TcVod from 'vod-js-sdk-v6'
    export default{
        data () {
            return {
                fileList: [],
                previewFile: undefined,
                dialogVisible: false,
                tcVod: new TcVod({
                    getSignature: this.getSignature
                })
            }
        },
        components: {},
        methods: {
            getSignature () {
                return this.$http.post('/media/video/signature/').then(({data}) => {
                    return data.signature
                })
            },
            handleRemove(file, fileList) {
//                console.log(file, fileList);
            },
            handlePreview(file) {
//                console.log(file);
            },
            handlePreview(file) {
                this.previewFile = file
                this.dialogVisible = true
            },
            onProgress(event, file, fileList){
//                console.log(['progress', event, file, fileList])
            },
            onError(err, file, fileList){
                console.log(['error', err, file, fileList])
            },
            onSuccess(response, file, fileList){
                console.log(['success', response, file, fileList])
                this.$emit('success', {response, file, fileList})
            },
            onChange (file, fileList) {
                this.fileList = fileList
            },
            toUrl(file) {
                var URL = window.URL || window.webkitURL
                let url = URL.createObjectURL(file)
                return url
            },
            uploadFiles (req) {
//                let d={
//                    fileId: '12345678',
//                    video: {url: 'http://baidu.com'},
//                    cover: {url: 'http://cover.baidu.com'}
//                }
//                console.log(d)
//                return Promise.resolve(d)
                let uploader = this.tcVod.upload({
                    mediaFile: req.file
                })
                uploader.on('media_progress', function (info) {
                    req.onProgress(info)
                })
                return uploader.done()
            }
        },
        computed: {}
    }
</script>
