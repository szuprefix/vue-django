/**
 * Created by denishuang on 2021/2/1.
 */
export default function copyContentH5(content) {
    var copyDom = document.createElement('div');
    copyDom.innerText = content;
    copyDom.style.position = 'absolute';
    copyDom.style.top = '0px';
    copyDom.style.right = '-9999px';
    document.body.appendChild(copyDom);
    //创建选中范围
    var range = document.createRange();
    range.selectNode(copyDom);
    //移除剪切板中内容
    window.getSelection().removeAllRanges();
    //添加新的内容到剪切板
    window.getSelection().addRange(range);
    //复制
    var successful = document.execCommand('copy');
    copyDom.parentNode.removeChild(copyDom);
    try {
        var msg = successful ? "successful" : "failed";
        console.log('Copy command was : ' + msg);
    } catch (err) {
        console.log('Oops , unable to copy!');
    }
}