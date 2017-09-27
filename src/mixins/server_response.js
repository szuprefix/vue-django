/**
 * Created by denishuang on 2017/7/27.
 */
import Qs from 'qs'
import moment from 'moment'
function joinErrors(errors) {
    let es = {}
    for (let n in errors) {
        es[n] = errors[n].join("")
    }
    return es
}

function formatDates(data) {
    let rs = {}
    for (let n in data) {
        let d = data[n]
        if (d instanceof Date) {
            rs[n] = moment(d).format('YYYY-MM-DD')
        } else {
            rs[n] = d
        }
    }
    return rs
}

export default  {
    data (){
        return {
            loading: false
        }
    },
    methods: {

        formPost: function (url, data, callback, errorCallback) {
            this.loading = true
            this.errors = {}
            this.$http.post(url, Qs.stringify(formatDates(data), {indices: false})).then(({data}) => {
                this.loading = false
                if (data.code === 0) {
                    this.$message('提交成功')
                    if (callback) {
                        callback(data)
                    }
                } else {
                    this.$message({message: data.msg, type: 'error'})
                    if (errorCallback) {
                        errorCallback(data)
                    } else {
                        this.errors = joinErrors(data.data.errors)
                    }
                }
            }).catch(this.onServerResponseError)
        },
        onServerResponseError: function (error) {
            this.loading = false
            console.log(error)
            this.$message({message: `系统异常: ${error.code} ${error.msg}`, type: 'error'})
        }
    }
}