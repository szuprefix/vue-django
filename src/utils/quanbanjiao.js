/**
 * Created by denishuang on 2018/2/21.
 */
/// 全角空格为12288，半角空格为32
/// 其他字符半角(33-126)与全角(65281-65374)的对应关系是：均相差65248
// 半角转换为全角函数
export function strB2Q (txtstring) {
    var tmp = ''
    for (var i = 0; i < txtstring.length; i++) {
        var a = txtstring.charCodeAt(i)
        if (a === 32) {
            tmp = tmp + String.fromCharCode(12288)
        }
        if (a < 127) {
            tmp = tmp + String.fromCharCode(a + 65248)
        }
    }
    return tmp
}
// 全角转换为半角函数
export function strQ2B (str) {
    var tmp = ''
    for (var i = 0; i < str.length; i++) {
        var a = str.charCodeAt(i)
        if (a === 8197 || a === 12288) {
            tmp += ' '
        } else if (a > 65248 && a < 65375) {
            tmp += String.fromCharCode(a - 65248)
        } else {
            tmp += str.charAt(i)
        }
    }
    return tmp
}

export default {
    strB2Q,
    strQ2B
}
