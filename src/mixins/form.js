/**
 * Created by denishuang on 2018/3/4.
 */

import server_response from './server_response'
import schema from 'async-validator'

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
        },
        submit: Function
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
            return f.type == 'boolean' ? 'checkbox' : ( f.type == 'decimal' ? 'number' : 'text')
        },
        _submit () {
            this.$emit('beforesubmit', this.values)
            this.loading = `正在${this.submitName}`
            if (this.submit) {
                return this.submit().then(this._submitSuccess).catch(this.onServerResponseError)
            } else {
                let action = this.method === 'post' ? this.$http.post : this.$http.put
                return action(this.url, this.values).then(({data}) => {
                    return this._submitSuccess(data)
                }).catch(this.onServerResponseError)
            } //.catch(this.onServerResponseError)

        },
        _submitSuccess(data){
            this.loading = false
            this.$message({message: `${this.submitName}成功`, type: 'success'})
            this.$emit("form-posted", data)
            return data
        },
        onSubmit () {
            let procedure = (valid) => {
                if (valid) {
                    this.errors = {}
                    this._submit()
                } else {
                    this.$message({message: '表单检验未通过，请按提示修改', type: 'error'})
                    return false
                }
            }
            let formValid = this.$refs.form && this.$refs.form.validate
            if (formValid) {
                formValid(procedure)
            } else {
                let validator = new schema(this.rules)
                validator.validate(this.values, (errors, fields) => {
                    // console.log(fields)
                    let valid = true
                    if (errors) {
                        this.errors = errors
                        valid = false
                    }
                    procedure(valid)
                })
            }


            // this.$refs['form'].validate()
        },
        getRuleType(f){
            if (f.multiple) {
                return 'array'
            }
            if (f.choices && f.choices.length > 0) {
                return typeof f.choices[0][0]
            }
            return f.type == 'field' ? 'string' : (f.type == 'decimal' ? 'number' : f.type)
        }

    },
    computed: {
        rules () {
            let d = {}
            let self = this
            // console.log(this.fieldItems)
            Object.keys(this.fieldItems).forEach((i) => {
                let f = this.fieldItems[i]
                let n = f.name
                let dt = {"CheckboxInput": Boolean}
                let rs = d[n] = f.rules || []
                if (f.required) {
                    rs.push({
                        type: this.getRuleType(f),
                        required: true,
                        message: `不能为空`
                    })


                }
                if (f.min_length) {
                    rs.push({min: f.min_length, message: `长度最小为${f.min_length}`})
                }
                if (f.max_length) {
                    rs.push({max: f.max_length, message: `长度最大为${f.max_length}`})
                }

            })
            return d

        },
        submitName () {
            return this.options.submitButtonText || '保存'
        }
    }
}