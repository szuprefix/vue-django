/**
 * Created by denishuang on 2023/3/13.
 */

import {
    defaultRules,
    defaultRuleType,
    defaultSpan,
    defaultWidget,
    defaultProps,
    normalizeItem,
    normalizeItems,
    getItemRules,
    joinErrors,
    flatAllGroupItems
} from './Form'
import ServerResponse from '../../mixins/server_response'
import Emitter from '../../mixins/emitter'
import Schema from 'async-validator'
export default{
    mixins: [
        ServerResponse, Emitter
    ],
    props: {
        ...defaultProps
    },
    data () {
        return {
            errors: {},
            value: {},
        }
    },
    components: {},
    // mounted () {
    //     console.log(this._items)
    // },
    methods: {
        defaultRules,
        defaultRuleType,
        defaultSpan,
        defaultWidget,
        normalizeItem,
        normalizeItems,
        getItemRules,
        joinErrors,
        _submit () {
            this.$emit('beforesubmit', this.value)
            this.loading = `正在${this.submitName}`
            if (this.submit) {
                return this.submit().then(this._submitSuccess)
            } else {
                let action = this.method === 'post' ? this.$http.post : this.$http.put
                return action(this.url, this.value).then(({data}) => {
                    return this._submitSuccess(data)
                })
            }

        },
        _submitSuccess (data) {
            this.loading = false
            this.$message({message: `${this.submitName}成功`, type: 'success'})
            this.$emit('form-posted', data)
            return data
        },
        genValuesWithFunctionWidget () {
            let d = this.value
            let fs = this._items.filter(a => a.widget instanceof Function)
            fs.forEach(a => {
                d[a.name] = a.widget(d)
            })
        },
        onSubmit () {
            this.genValuesWithFunctionWidget()
            let procedure = (valid) => {
                if (valid) {
                    this.errors = {}
                    this._submit().catch(e => {
                        let error = this.onServerResponseError(e)
                        if (error.code === 400) {
                            this.errors = this.joinErrors(error.msg)
                        }
                    })
                } else {
                    this.$message({message: '表单检验未通过，请按提示修改', type: 'error'})
                    return false
                }
            }
            let formValid = this.$refs.form && this.$refs.form.validate
            if (formValid) {
                formValid(procedure)
            } else {
                let validator = new Schema(this.rules)
                validator.validate(this.value, (errors) => {
                    let valid = true
                    if (errors) {
                        this.errors = errors
                        this.broadcast('FormGroup', 'form-error', [errors])
                        // var fs = this.$refs
                        // errors.forEach((f) => {
                        //     let v = fs[f.field] && fs[f.field][0]
                        //     if(!v) {
                        //         return
                        //     }
                        //     // v.focus() && v.blur()
                        //     try {
                        //         v.onBlur()
                        //     } catch (error) {
                        //         console.error(error)
                        //     }
                        // })
                        valid = false
                    }
                    procedure(valid)
                })
            }

        },

    },
    computed: {
        rules () {
            let d = {}
            this._items.forEach((f) => {
                let n = f.name
                let rs = d[n] = f.rules || []
                rs.concat(this.defaultRules(f))
            })
            return d
        },
        _items () {
            let items = this.items.length > 0 ? this.items : flatAllGroupItems(this.groups)
            return this.normalizeItems(items)
        },
        formGroups () {
            return (this.groups.length > 0) ? this.groups : [{name: '', items: this.items}]
        }
    }
}
