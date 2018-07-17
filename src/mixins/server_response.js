/**
 * Created by denishuang on 2017/7/27.
 */
import Qs from 'qs'
import { format } from 'date-fns'
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
            rs[n] = format(d, 'YYYY-MM-DD')
        } else {
            rs[n] = d
        }
    }
    return rs
}

export default  {
    data (){
        return {
            loading: false,

        }
    },
    methods: {
        joinErrors,
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
        alertError(error){
            this.$message({
                message: `${error.code}错误:${error.msg}`, type: 'error'
            })

        },
        onServerResponseError: function (error) {
            this.loading = false
            if(error == 'cancel'){  // confirm dialog cancel ?
               return
            }
            if ([404,403,405].includes(error.code) && error.msg.detail) {
                error.msg = error.msg.detail
            }
            if (error.code === 400) {
                this.errors = this.formErrors = joinErrors(error.msg)
            } else if (error.code === 401) {
                // this.$router.replace('/auth/login/')
                this.$store.state.bus.$emit("user-logout")
            } else if (error.code === 502){
                this.alertError("网关错误")
            } else {
                this.alertError(error)
            }
        }
    }
}