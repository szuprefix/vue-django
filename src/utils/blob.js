/**
 * Created by denishuang on 2020/4/29.
 */

export function img2canvas(img) {
    let canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    canvas.getContext('2d').drawImage(img, 0, 0)
    return canvas
}

export function dataurl2blob(durl) {
    let arr = durl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n)
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
    }
    return new Blob([u8arr], {type:mime})
}

export function img2blob(img) {
    return dataurl2blob(img2canvas(img).toDataURL('image/png'))
}