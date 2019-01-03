/**
 * Created by denishuang on 2018/4/20.
 */

import server_response from './server_response'
import schema from 'async-validator'

export default{
    mixins: [
        server_response
    ],
    props: {
        formItems: Array,
        formUrl: String,
        formMethod: {
            type: String, default: 'post'
        },
        formSubmit: Function,
        formSubmitName: {
            type: String, default: '提交'
        },
        formInline: {
            type: Boolean, default: false
        },
        formHideRequiredAsterisk:{
            type: Boolean, default: false
        },
        formSize: {
            type: String, default: null
        },
        formLabelWidth: {
            type: String, default: '160px'
        },
        formTextareaSize: {
            type: Object, default(){
                return {minRows: 4, maxRows: 8}
            }
        },
        formNoLabel: {type:Boolean, default:false},
        formItemStyle: {
            type: Object, default(){
                return {minWidth: '350px'}
            }
        }
    },
    data () {
        return {
            formErrors: {},
            formValue: {},
        }
    },
    components: {},
    methods: {

        _formSubmit () {
            this.$emit('beforesubmit', this.formValue)
            this.loading = `正在${this.formSubmitName}`
            if (this.formSubmit) {
                return this.formSubmit().then(this._formSubmitSuccess)
            } else {
                let action = this.formMethod === 'post' ? this.$http.post : this.$http.put
                return action(this.formUrl, this.formValue).then(({data}) => {
                    return this._formSubmitSuccess(data)
                })
            }

        },
        _formSubmitSuccess(data){
            this.loading = false
            this.$message({message: `${this.formSubmitName}成功`, type: 'success'})
            this.$emit("form-posted", data)
            return data
        },
        onSubmit () {
            let procedure = (valid) => {
                if (valid) {
                    this.formErrors = {}
                    this._formSubmit().catch(this.onServerResponseError)
                } else {
                    this.$message({message: '表单检验未通过，请按提示修改', type: 'error'})
                    return false
                }
            }
            let formValid = this.$refs.form && this.$refs.form.validate
            if (formValid) {
                formValid(procedure)
            } else {
                let validator = new schema(this.formRules)
                validator.validate(this.formValue, (errors /*, fields*/) => {
                    let valid = true
                    if (errors) {
                        this.formErrors = errors
                        var fs = this.$refs
                        errors.forEach((f) => {
                            let v = fs[f.field][0]
                            // v.focus() && v.blur()
                            v.onBlur()
                        })
                        valid = false
                    }
                    procedure(valid)
                })
            }

        },
        formDefaultWidget (f) {
            return f.type == 'boolean' ? 'checkbox' : (['date', 'datetime', 'time'].includes(f.type) ? f.type : ( ['integer','decimal'].includes(f.type) ? 'number' : 'text'))
        },
        formDefaultRuleType(f){
            if (f.multiple) {
                return 'array'
            }
            if (f.choices && f.choices.length > 0) {
                return typeof f.choices[0][0]
            }
            return f.model ? 'number' : (['field','time'].includes(f.type) ? 'string' : (['integer', 'decimal'].includes(f.type) ? 'number' : f.type))
        },
        formDefaultSpan(f){
            return f.widget == 'textarea' ? {xs: 24, sm: 24, md: 24, lg:24, xl: 24} : {xs: 24, sm: 24, md: 12, lg:12, xl: 8}
        },
        formDefaultRules(f){
            let rs = []
            if (f.required) {
                rs.push({
                    type: this.formDefaultRuleType(f),
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
            return rs
        },
        formNormalizeItem(i){
            let a = Object.assign({}, i)
            a.label = a.label || a.name
            a.rules = a.rules || this.formDefaultRules(a)
            a.widget = a.widget || this.formDefaultWidget(a)
            let sp = a.span
            a.span = sp && (typeof  sp === 'number' && {xs:sp,sm:sp,md:sp,lg:sp,xl:sp} || sp) || {}
            a.span = Object.assign({}, this.formDefaultSpan(a), a.span)
            return a
        },
        formNormalizeItems(formItems){
            return formItems.map((i) => {
                return this.formNormalizeItem(i)
            })
        }

    },
    computed: {
        formRules () {
            let d = {}
            Object.keys(this._formItems).forEach((i) => {
                let f = this._formItems[i]
                let n = f.name
                let rs = d[n] = f.rules || []
                rs.concat(this.formDefaultRules(f))

            })
            return d

        },
        _formItems() {
            return this.formNormalizeItems(this.formItems)
        }
    }
}