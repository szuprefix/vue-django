/**
 * Created by denishuang on 2022/9/23.
 */
import {getFileMd5Async} from './file_md5'
import {template} from 'lodash'
import {format} from 'date-fns'
import axios from '@/configs/axios'

export function getNameParts(fn) {
    let ps = fn.split('.')
    let extName
    let fileName = fn
    let baseName = fn
    if (ps.length > 1) {
        extName = ps[ps.length - 1]
        baseName = fn.substr(0, fn.length - 1 - extName.length)
    }
    return {fileName, baseName, extName}
}

export function fileFromResponse(response) {
    let url = response.request.responseURL
    let ps = url.split('/')
    let fn = ps[ps.length - 1]
    ps = fn.split('?')
    fn = ps[0]
    let ct = response.headers['content-type']
    let {extName, baseName} = getNameParts(fn)
    if (!extName || extName.length === 0) {
        extName = ct.split('/')[1]
    }
    return new window.File([response.data], `${baseName}.${extName}`, {type: ct})
}
export function qcloudUpload (fileName, file, options) {
    let getAuthorization  = (opt, callback) => {
        let signUrl = template(options.signUrl)(options.context)
        return axios.post(signUrl).then(({data}) => {
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
    }
        return new Promise((resolve, reject) => {
            import('cos-js-sdk-v5').then(module => {
                let TcCos = module.default
                let tcCos = new TcCos({
                    getAuthorization
                })
                tcCos.putObject({
                    Bucket: options.bucket, /* 必须 */
                    Region: options.region, /* 存储桶所在地域，必须字段 */
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
        }).then(r => {
            let url = `https://${r.Location}`
            return {fileName, file, url}
        })
}
//
// export function aliOssLoad() {
//     return import('ali-oss').then(module => {
//         return module.default
//     })
// }
// export function aliOssClient(OSS, signUrl) {
//     return window.http.post(signUrl).then(({data}) => {
//         let creds = data.Credentials
//         const client = new OSS({
//             region: data.region,
//             accessKeyId: creds.AccessKeyId,
//             accessKeySecret: creds.AccessKeySecret,
//             stsToken: creds.SecurityToken,
//             bucket: data.bucket
//         })
//
//         return client
//     })
// }
// export function aliUpload(fileName, file, options) {
//     return aliOssLoad().then(OSS => {
//         return aliOssClient(OSS, `${options.signUrl}?name=${fileName}`)
//     }).then(client => {
//         options = {
//             partSize: 100 * 1024,
//             meta: {},
//             ...options
//         }
//         let co = client.options
//         // console.log(co)
//         return client.multipartUpload(fileName, file, options).then(res => {
//             return {fileName, file, url: `https://${co.bucket}.${co.endpoint.hostname}/${res.name}`}
//         })
//     })
// }

export function awsUpload(fileName, file, options) {
    return axios.post(`${options.signUrl}?name=${fileName}`).then(({data}) => {
        let url = data.url
        let hs = {
            'Content-Type': file.type,
            // 'x-amz-acl': 'public-read',
            // 'Expect': '100-continue'
        }
        let region = data.region
        return axios.put(url,file, {headers: hs}).then((r) => {
            // console.log(r)
            let durl =  url.split('?')[0].replace('.s3.amazonaws.', `.s3.${region}.amazonaws.`)
            return {fileName, file, url: durl}
        })
    })
}

export function getFileNameNumber(fn) {
    let re = /(\d+)\./g
    let m = re.exec(fn)
    if (m) {
        return m[1]
    }
}

export function genFileNameContext(file, fnt, context) {
    let fn = file.name
    let {extName, fileName, baseName} = getNameParts(fn)
    let d = new Date()
    let dateTime = format(d, 'YYYYMMDDHHmmssSSS')
    let ctx = {
        ...context,
        extName,
        fileName,
        baseName,
        dateTime,
        number: getFileNameNumber(fn)
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
}

export function genFileName(file, nameTemplate, context) {
    let fnt = nameTemplate || '${md5}.${extName}'
    return genFileNameContext(file, fnt, context).then(ctx => template(fnt)(ctx))
}

export function upload(file, options) {
    let func = awsUpload
    // if(options.vendor === 'aliyun') {
    //     func = aliUpload
    // }
    if(options.vendor === 'qcloud') {
        func = qcloudUpload
    }
    return genFileName(file, options.fileName, options.context).then(fileName => func(fileName, file, options))
}

export default upload