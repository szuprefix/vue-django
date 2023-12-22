/**
 * Created by denishuang on 2023/11/9.
 */
/**
 * Created by denishuang on 2018/3/12.
 */

let STATUS_MAP = {
    'PENDING': '排队中',
    'STARTED': '开始执行',
    'RETRY': '重试',
    'SUCCESS': '任务成功',
    'FAILURE': '任务失败',
    'UPLOAD': '上传中',
    'TRAIN_MODEL': '模型训练中',
    'SAVE_MODEL': '模型持久化',
    'READ_EXCEL': '读取Excel',
    'READ_TABLE': '读取数据表',
    'SAVE_TABLE': '保存数据到表'
}
export default  function (task) {
    let a = {
        statusMap: STATUS_MAP,
        eventSource: null,
        process: null,
        task,
        asyncStatusMap(status){
            let a = this.statusMap[status]
            return a || status
        },
        monitor(){
            let promise = new Promise((resolve, reject) => {
                this.loading = this.asyncStatusMap(this.task.status)
                let es = this.eventSource = new EventSource(`/api/common/async_result/${this.task.id}/`)
                es.addEventListener("message", (e) => {
                    let rs = JSON.parse(e.data)
                    if (rs.task_id !== this.task.id) {
                        console.log(`got other task id , ignore: ${rs.task_id}`)
                        return
                    }
                    rs.text = this.asyncStatusMap(rs.status)
                    if (this.process) {
                        this.process(rs)
                    }
                    console.log(rs)
                    if (['SUCCESS', 'FAILURE'].includes(rs.status)) {
                        this.eventSource.close()
                        if (rs.status === 'SUCCESS') {
                            resolve(rs)
                        } else if (rs.status === 'FAILURE') {
                            reject({code: 500, msg: rs.result, asyncResult: rs})
                        }
                    }
                })
                es.addEventListener("error", (err) => {
                    reject(err)
                    console.error("EventSource failed:", err);
                })

            })
            return promise
        }
    }
    return a
}

