/**
 * Created by denishuang on 2018/3/12.
 */
export default  {
    methods: {
        asyncStatusMap(status){
            return {
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
            }[status]
        },
        monitorAsyncResult(task){
            let promise = new Promise((resolve, reject) => {

                this.loading = this.asyncStatusMap(task.status)
                let url = `ws://${location.host}/api/async_result/?task_id=${task.id}`
                console.log(url)
                this.ws = new WebSocket(url)
                this.ws.onload = function (e) {
                    console.log('websocket conneted.')
                }
                let self = this
                this.ws.onmessage = (e) => {
                    let rs = JSON.parse(e.data)
                    if (rs.task_id !== task.id) {
                        console.log(`got other task id , ignore: ${rs.task_id}`)
                        return
                    }
                    this.loading = this.asyncStatusMap(rs.status)
                    console.log(rs)
                    if (['SUCCESS', 'FAILURE'].includes(rs.status)) {
                        this.loading = false
                        this.ws.close()
                        this.ws = null
                        if (rs.status === 'SUCCESS') {
                            resolve(rs)
                        } else if (rs.status === 'FAILURE') {
                            reject({code: 500, msg: rs.result, asyncResult: rs})
                        }
                    }
                }

            })
            return promise
        },
    },
    computed: {
        asyncResultUrl(){
            return `ws://${location.host}/api/async_result/?task_id=\$\{task_id\}`
        },
    }
}