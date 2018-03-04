/**
 * Created by denishuang on 2018/3/4.
 */

import server_response from './server_response'
export default{
    mixins: [
        server_response
    ],
    props: {
        fieldItems: {
            type: Array,
            default: []
        },
        values: Object,
        options: {
            type: Object, default(){
                return {}
            }
        },
        url: String,
        extraWidgets: {
            type: Object, default(){
                return {}
            }
        },
        method: {
            type: String, default: 'post'
        }
    },
    data () {
        return {
            errors: {},
            loading: false
        }
    },
    created () {

    },
    components: {},
    methods: {

        getWidget (f) {
            return f.type == 'boolean' ? 'checkbox' : 'text'
        },
        submit () {
            this.$emit('beforesubmit', this.values)
            let action = this.method === 'post' ? this.$http.post : this.$http.put
            return action(this.url, this.values).then(({data}) => {
                this.$message({message: `${this.submitName}成功`, type: 'success'})
                this.$emit("form-posted", data)
                return data
            }).catch(this.onServerResponseError)

        },
        onSubmit () {
            this.$refs['form'].validate((valid) => {
                if (valid) {
                    this.errors = {}
                    this.submit()
                } else {
                    this.$message({message: '表单检验未通过，请按提示修改', type: 'error'})
                    return false
                }
            })
        }

    },
    computed: {
        rules () {
            let d = {}
            let self = this
            Object.keys(this.fieldItems).forEach((i) => {
                let f = this.fieldItems[i]
                let n = f.name
                let dt = {"CheckboxInput": Boolean}
                let rs = d[n] = []
                if (f.required) {
                    rs.push({
                        type: f.type,
                        required: true,
                        message: `不能为空`,
                        trigger: [].includes(f.widge) ? 'change' : 'blur'
                    })

                }
                if (f.min_length) {
                    rs.push({min: f.min_length, message: `长度最小为${f.min_length}`, trigger: 'change'})
                }
                if (f.max_length) {
                    rs.push({max: f.max_length, message: `长度最大为${f.max_length}`, trigger: 'change'})
                }

            })
            return d

        },
        submitName () {
            return this.options.submitButtonText || '保存'
        }
    }
}