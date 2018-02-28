/**
 * Created by denishuang on 2017/9/19.
 */

const errMap = {
    401: "您需要先验证身份.",
    403: "您没有执行该操作的权限.",
    404: "找不到相关资源.",
    408: "请求超时了."
}

export default function (c) {
    return errMap[c] || (c < 500 ? "客户端请求出错, 您可能需要检查一下是否录入有误." : "服务器端出现异常, 已发邮件通知系统管理员处理, 您可以稍后重试.")
}