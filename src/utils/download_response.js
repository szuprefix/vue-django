/**
 * Created by denishuang on 2018/1/10.
 */

export default (blob, fileName) => {
    let a = document.createElement('a')
    let url = window.URL.createObjectURL(blob)
    let filename = fileName || 'response.data'
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
}