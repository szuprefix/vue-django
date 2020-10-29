/**
 * Created by denishuang on 2018/3/12.
 */
export default  function (task, context) {
    let sm = {
        'PENDING': '排队中',
        'STARTED': '开始执行',
        'RETRY': '重试',
        'SUCCESS': '任务成功',
        'FAILURE': '任务失败',
        ...context.status
    }
    let progress = context.progress || function () {}
    let promise = new Promise((resolve, reject) => {
        let s = task.status
        let ps = s.split(' ')
        // progress({status:sm[ps[0]], text: ps[1]})
        let protocal = location.protocol === "https:" ? "wss" : "ws"
        let url = `${protocal}://${location.host}/api/common/async_result/${task.id}/`
        let ws = new WebSocket(url)
        ws.onload = function () {
            console.log('websocket conneted.')
        }
        ws.onmessage = (e) => {
            let rs = JSON.parse(e.data)
            if (rs.task_id !== task.id) {
                console.log(`got other task id , ignore: ${rs.task_id}`)
                return
            }
            ps = rs.status.split(' ')
            progress({status:sm[ps[0]] || ps[0], text: ps[1]})
            console.log(rs)
            if (['SUCCESS', 'FAILURE'].includes(rs.status)) {
                ws.close()
                ws = null
                if (rs.status === 'SUCCESS') {
                    resolve(rs)
                } else if (rs.status === 'FAILURE') {
                    reject({code: 500, msg: rs.result, asyncResult: rs})
                }
            }
        }

    })
    return promise
}
