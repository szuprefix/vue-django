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
    props: {
        restStyle: {
            type: Boolean,
            default: true
        }
    },
    data (){
        return {
            loading: false,

        }
    },
    methods: {

        submitData: function (url, data, successMsg, isCreate) {
            this.loading = true
            this.errors = {}
            let action = isCreate ? this.$http.post : this.$http.put
            let dt = this.restStyle ? data : Qs.stringify(formatDates(data))
            let promise = action(url, dt).then(({data}) => {
                this.loading = false
                if (!this.restStyle && data.code != 0) {
                    return Promise.reject({code: 400, msg: data.data.errors})
                }
                this.$message({message: successMsg || '提交成功', type: 'success'})
                return data
            }).catch(this.onServerResponseError)
            return promise
        },
        onServerResponseError: function (error) {
            this.loading = false
            if(error == 'cancel'){  // confirm dialog cancel ?
               return
            }
            if (error.code === 404 && error.msg.detail) {
                error.msg = error.msg.detail
            }
            if (error.code === 400) {
                this.errors = joinErrors(error.msg)
            } else if (error.code === 401) {
                // this.$router.replace('/auth/login/')
            } else {
                const h = this.$createElement;
                this.$message({
                    message: `${error.code}错误:${error.msg}`, type: 'error'
                })
            }
        }
    }
}