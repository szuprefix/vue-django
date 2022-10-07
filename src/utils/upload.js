/**
 * Created by denishuang on 2022/9/23.
 */
import {getFileMd5Async} from './file_md5'
import {template} from 'lodash'
import {format} from 'date-fns'
import axios from 'axios'

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

export function aliOssLoad() {
    return import('ali-oss').then(module => {
        return module.default
    })
}
export function aliOssClient(OSS, signUrl) {
    return window.http.post(signUrl).then(({data}) => {
        let creds = data.Credentials
        const client = new OSS({
            region: data.region,
            accessKeyId: creds.AccessKeyId,
            accessKeySecret: creds.AccessKeySecret,
            stsToken: creds.SecurityToken,
            bucket: data.bucket
        })

        return client
    })
}
export function aliUpload(fileName, file, options) {
    return aliOssLoad().then(OSS => {
        return aliOssClient(OSS, options.signUrl)
    }).then(client => {
        options = {
            partSize: 100 * 1024,
            meta: {},
            ...options
        }
        let co = client.options
        console.log(co)
        return client.multipartUpload(fileName, file, options).then(res => {
            return {fileName, file, url: `https://${co.bucket}.${co.endpoint.hostname}/${res.name}`}
        })
    })
}

export function awsUpload(fileName, file, options) {
    return window.http.post(`${options.signUrl}?name=${fileName}`).then(({data}) => {
        let url = data.url
        let hs = {
            'Content-Type':'application/octet-stream',
            'x-amz-acl': 'public-read',
            // 'Expect': '100-continue'
        }
        let region = data.region
        return axios.put(url,file, {headers: hs}).then((r) => {
            console.log(r)
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

export function genFileName(file, nameTemplate) {
    let fnt = nameTemplate || '${md5}.${extName}'
    return genFileNameContext(file, fnt).then(ctx => template(fnt)(ctx))
}

export function upload(file, options) {
    return genFileName(file, options.fileName).then(fileName => awsUpload(fileName, file, options))
}

export default upload