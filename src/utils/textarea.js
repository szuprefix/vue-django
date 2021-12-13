/**
 * Created by denishuang on 2021/10/24.
 */

//获取位置
export function getLocation(elm) {
    if (elm.createTextRange) { // IE
        var range = document.selection.createRange();
        range.setEndPoint('StartToStart', elm.createTextRange());
        return range.text.length;
    } else if (typeof elm.selectionStart == 'number') { // Firefox
        return elm.selectionStart;
    }
}

//设置位置
export function setLocation(elm, n) {
    if (n > elm.value.length)
        n = elm.value.length;
    if (elm.createTextRange) {   // IE
        var textRange = elm.createTextRange();
        textRange.moveStart('character', n);
        textRange.collapse();
        textRange.select();
    } else if (elm.setSelectionRange) { // Firefox
        elm.setSelectionRange(n, n);
        elm.focus();
    }
}

export function insertContent(elm, str) {
    let p = getLocation(elm)
    let s = elm.value
    return s.slice(0, p) + str + s.slice(p)
}