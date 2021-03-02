<template>
    <div>
        <el-upload :http-request="uploadFile"
                   class="image-uploader"
                   ref="upload"
                   action="noaction"
                   accept=".mp3,.m4a"
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

            <i class="el-icon-plus"></i>
        </el-upload>

        <audio :src="fileList[0].url" controls v-if="fileList.length>0"></audio>
    </div>
</template>
<script>
    import {format} from 'date-fns'
    import {template} from 'lodash'
    import {getFileMd5Async} from 'vue-django/src/utils/file_md5'
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
            getAuthorization (OSS, func) {
                let signUrl = template(this.signUrl)(this.context)
                return this.$http.post(signUrl).then(({data}) => {
                    let creds = data.Credentials
                    const client = new OSS({
                        region: data.region,
                        accessKeyId: creds.AccessKeyId,
                        accessKeySecret: creds.AccessKeySecret,
                        stsToken: creds.SecurityToken,
                        bucket: data.bucket
                    })

                    return func(client)
                })
            },
            onPreview(file) {
                this.dialogImageUrl = file.url
                this.dialogVisible = true
            },
            onProgress(event, file, fileList){
                console.log(['progress', event, file])
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
                sf.url = `${this.urlPrefix}${response.name}`
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
                    if (fnt.includes('${md5}')) {
                        return getFileMd5Async(file).then(md5 => {
                            ctx.md5 = md5
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
                    console.log(fileName)
                    return import('ali-oss').then(module => {
                        let OSS = module.default
                        return new Promise((resolve, reject) => {
                            this.getAuthorization(OSS, (client) => {
                                const options = {
                                    progress: this.onProgress,
                                    partSize: 100 * 1024,
                                    meta: {},
                                }
                                client.multipartUpload(fileName, file, options).then((res) => {
                                    resolve(res)
                                }).catch((err) => {
                                    reject(err)
                                })
                            })
                        })
                    })
                })


            }
        },
        computed: {
            urlPrefix() {
                return `https://${this.$store.state.party.settings.aliyun.oss.domain}/`
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
<style>
    .el-upload.hidden {
        display: none;
    }
</style>
