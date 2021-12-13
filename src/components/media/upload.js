/**
 * Created by denishuang on 2021/10/24.
 */


import {format} from 'date-fns'
import {template} from 'lodash'
import {getFileMd5Async} from '../../utils/file_md5'

export function getFileNumber(fn) {
    let re = /(\d+)\./g
    let m = re.exec(fn)
    if (m) {
        return m[1]
    }
}
export function genFileNameContext (file, fnt, context) {
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
        ...context,
        extName,
        fileName,
        baseName,
        dateTime,
        number: getFileNumber(fn)
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
}

export function qcloudUpload (req, getAuthorization, options, context, fnt) {
    let file = req.file
    fnt = fnt || '${dateTime}.${extName}'
    return genFileNameContext(file, fnt, context).then(ctx => {
        file.uploadContext = ctx
        let fileName = template(fnt)(ctx)
        return new Promise((resolve, reject) => {
            import('cos-js-sdk-v5').then(module => {
                let TcCos = module.default
                let tcCos = new TcCos({
                    getAuthorization
                })
                tcCos.putObject({
                    ...options,
                    Key: fileName,
                    Body: file,
                    onProgress: function (info) {
                        req.onProgress(info)
                    }
                }, function (err, data) {
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