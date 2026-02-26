<template>
    <div>
        <el-upload :http-request="uploadFile"
                   class="image-uploader"
                   ref="upload"
                   action="noaction"
                   accept=".jpg,.png,.jpeg,.gif"
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
    import {format} from 'date-fns'
    import {template} from 'lodash'
    import {getFileMd5Async} from '../../../utils/file_md5'
    export default {
        model: {
            event: 'change'
        },
        props: {
            signUrl: String,
            fileName: String,
            context: Object,
            bucket: {type:String, default: ''},
            region: {type: String, default: 'ap-guangzhou'},
            urls: Array
        },
        data () {
            return {
                fileList: this.urls.map(u => {
                    return {url: u}
                }),
                elUploader: undefined,
//                tcCos: new TcCos({
//                    getAuthorization: this.getAuthorization
//                }),
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
//                    console.debug(this.$attrs.limit, this.fileList.length)
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
            genFileNameContext (file, fnt) {
                let fn = file.name
                let ps = fn.split('.')
                let extName
                let fileName = fn
                let baseName = fn
                if (ps.length > 1) {
                    extName = ps[ps.length - 1]
                    baseName = fn.substr(0, fn.length - 1 - extName.length)
                }
                let d = new Date()
                let dateTime = format(d, 'YYYYMMDDHHmmssSSS')
                let ctx = {
                    ...this.context,
                    extName,
                    fileName,
                    baseName,
                    dateTime,
                    number: this.getFileNumber(fn)
                }
                return Promise.resolve(ctx).then(ctx => {
                    if (fnt.includes('${md5}') || fnt.includes('${md5short}')) {
                        return getFileMd5Async(file).then(md5 => {
                            ctx.md5 = md5
                            ctx.md5short = ctx.md5.slice(0,6)
                            return ctx
                        })
                    } else {
                        return ctx
                    }
                })
            },
            uploadFile (req) {
                let file = req.file
                let fnt = this.fileName || '${dateTime}.${extName}'
                return this.genFileNameContext(file, fnt).then(ctx => {
                    file.uploadContext = ctx
                    let fileName = template(fnt)(ctx)
                    return new Promise((resolve, reject) => {
                        import('cos-js-sdk-v5').then(module => {
                            let TcCos = module.default
                            let tcCos = new TcCos({
                                getAuthorization: this.getAuthorization
                            })
                            tcCos.putObject({
                                Bucket: this.bucket, /* 必须 */
                                Region: this.region, /* 存储桶所在地域，必须字段 */
                                Key: fileName,
                                Body: file,
                                onProgress: function (info) {
                                    console.log('tcCos.onProgress', info, req)
                                    req.onProgress(info)
                                }
                            }, function (err, data) {
//                        console.log(err || data)
                                if (err) {
                                    reject(err)
                                } else {
                                    resolve(data)
                                }
                            })
                        })
                    })
                })
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
