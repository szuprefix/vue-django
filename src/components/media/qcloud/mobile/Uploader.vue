<template>
    <uploader :after-read="afterRead" :preview-options="{images: previewUrls}" @delete="onDelete" v-model="fileList"
              v-bind="[$props, $attrs]"/>
</template>
<script>
    import {Uploader} from 'vant'
    import {format} from 'date-fns'
    import {template} from 'lodash'
    import ServerResponse from 'vue-django/src/mixins/server_response'
    export default{
        mixins: [ServerResponse],
        props: {
            signUrl: String,
            fileName: String,
            context: Object,
            bucket: String,
            region: {type: String, default: 'ap-guangzhou'},
            value: {type: Array, default: () => []}
        },
        data () {
            return {
                fileList: this.genFileList(),
                elUploader: undefined,
//                tcCos: new TcCos({
//                    getAuthorization: this.getAuthorization
//                })
            }
        },
        components: {Uploader},
        methods: {
            genFileList () {
                return this.value.map(u => {
                    return {url: u}
                })
            },
            getAuthorization (options, callback) {
                let signUrl = template(this.signUrl)(this.context)
                return this.$http.post(signUrl).then(({data}) => {
                    let d = {
                        TmpSecretId: data.credentials.tmpSecretId,
                        TmpSecretKey: data.credentials.tmpSecretKey,
                        XCosSecurityToken: data.credentials.sessionToken,
                        StartTime: data.startTime,
                        ExpiredTime: data.expiredTime,
                    }
                    callback(d)
                })
            },
            afterRead (file, detail) {
                let fs
                if (file instanceof Array) {
                    fs = file
                } else {
                    fs = [file]
                }
                fs.forEach(f => {
                    this.uploadFile(f).then(data => {
                        let url = 'https://' + data.Location
                        this.fileList[detail.index] = Object.assign(this.fileList[detail.index], {url})
                        this.onChange()
                        this.$emit('uploaded', {...detail, url, name: data.name})
                    }).catch(this.onServerResponseError)
                })
            },
            onChange () {
                this.$emit('input', this.fileList.map(a => a.url))
//                console.log(this.fileList)
            },
            onDelete (file, detail) {
                this.onChange()
                this.$emit('delete', detail)
            },
            getFileNumber(fn) {
                let re = /(\d+)\./g
                let m = re.exec(fn)
                if (m) {
                    return m[1]
                }
            },
            getFileNameContext (fn) {
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
                return {
                    extName,
                    fileName,
                    baseName,
                    dateTime,
                    number: this.getFileNumber(fn)
                }
            },
            uploadFile (req) {
                req.status = 'uploading'
                req.message = '上传中...'
                let file = req.file
                let fn = file.name
                let ctx = {...this.context, ...this.getFileNameContext(fn)}
                file.uploadContext = ctx
//                console.log(ctx)
                let fileName = template(this.fileName || '${dateTime}.${extName}')(ctx)
//                console.log(fileName)
//                return
                return new Promise((resolve, reject) => {
                    import('cos-js-sdk-v5').then(TcCos => {
                        let tcCos = new TcCos({
                            getAuthorization: this.getAuthorization
                        })
                        tcCos.putObject({
                            Bucket: this.bucket, /* 必须 */
                            Region: this.region, /* 存储桶所在地域，必须字段 */
                            Key: fileName,
                            Body: file,
                            onProgress: function (info) {
//                            console.log('tcCos.onProgress', info, file)
                                req.message = `${info.percent * 100}%`
//                            req.onProgress(info)
                            }
                        }, function (err, data) {
//                        console.log(err || data)
                            data.name = fn
                            if (err) {
                                req.status = 'failed'
                                req.message = '上传失败'
                                reject(err)
                            } else {
                                req.status = undefined
                                req.message = undefined
                                resolve(data)
                            }
                        })
                    })
                })
            },
            addThumbParams (fileList, size) {
                return fileList.map(f => {
                    if (f.url && f.url.startsWith('http')) {
                        return f.url.concat(`?imageMogr2/thumbnail/${size}x${size}`)
                    }
                    return f
                })
            }
        },
        computed: {
            previewUrls () {
                return this.addThumbParams(this.fileList, 640)
            }
        },
        watch: {
            value () {
                this.fileList = this.genFileList()
            }
        }
    }
</script>
