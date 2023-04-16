/**
 * Created by denishuang on 2018/1/10.
 */

export function download(url, fileName) {
    let req = new XMLHttpRequest()
    req.open('GET', url, true)
    req.responseType = 'blob'
    return new Promise((resolve) => {
        req.onload = () => {
            save(req.response, fileName)
            resolve(req.response)
        }
        req.send()
    })
}
export function save(blob, fileName) {
    let a = document.createElement('a')
    let url = window.URL.createObjectURL(blob)
    let filename = fileName || 'response.data'
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
}


export default save

// let CORS_BLACK_LIST = []
//
// export function loadRemoteFile(url) {
//     let origin = url.split('/')[2]
//     if (CORS_BLACK_LIST.includes(origin)) {
//         return Promise.reject('blocked by remote CORS')
//     }
//     return axios.get(url, {responseType: 'blob'}).then(fileFromResponse)
// }
//
// export function tryLoadRemoteFile(url, proxy) {
//     return loadRemoteFile(url).catch(err => {
//         if (err.code === 0) {
//             let origin = url.split('/')[2]
//             CORS_BLACK_LIST.push(origin)
//             console.log('add to CORS_BLACK_LIST:', origin)
//         }
//         return loadRemoteFile(`${proxy}${encodeURIComponent(url)}`)
//     })
// }