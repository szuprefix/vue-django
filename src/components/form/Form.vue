<template>
    <el-form ref="form" :inline="elOptions.inline" :size="elOptions.size" :model="formValue" v-if="value"
             :inline-message="elOptions.inlineMessage" :hide-required-asterisk="elOptions.hideRequiredAsterisk"
             label-position="elOptions.labelPosition"
             :label-width="elOptions.labelWidth || elOptions.noLabel && '0px' || (!elOptions.inline && '160px')"
             v-loading="loading" :element-loading-text="loading">

        <slot name="header"></slot>
        <el-alert :title="errors.non_field_errors" type="error" v-if="errors.non_field_errors"
                  :closable="false"></el-alert>
        <el-row>
            <template v-for="f in formItems" v-if="canEdit(f)">
                <el-col :xs="f.span.xs" :sm="f.span.sm" :md="f.span.md" :lg="f.span.lg" :xl="f.span.xl"
                        :key="f.name" v-if="!elOptions.inline && !elOptions.oneColumn && f.widget !== 'hidden'">
                    <form-item :field="f" v-model="formValue" :options="options" :error="errors[f.name]"></form-item>
                </el-col>
                <form-item :field="f" v-model="formValue" :options="options" :error="errors[f.name]" v-else></form-item>

            </template>
            <slot name="submit">
                <el-col :xs="elOptions.inline?12:24" :sm="elOptions.inline?8:24" :md="elOptions.inline?6:24"
                        :lg="elOptions.inline?4:24"
                        :xl="elOptions.inline?3:24" v-if="!elOptions.inline">
                    <el-form-item>
                        <actions :items="_actions"></actions>
                    </el-form-item>
                </el-col>
                <el-form-item v-else>
                    <actions :items="_actions"></actions>
                </el-form-item>
            </slot>
        </el-row>
    </el-form>
</template>
<script>
    import server_response from '../../mixins/server_response'
    import schema from 'async-validator'
    import FormItem from './FormItem.vue'
    import Form from './Form'
    import Actions from '../layout/Actions.vue'
    export default{
        mixins: [
            server_response
        ],
        props: {
            value: Object,
            actions: Array,
            items: {type: Array, default: () => []},
            url: String,
            method: {
                type: String, default: 'post'
            },
            options: {
                type: Object,
                default: () => {
                    return {}
                }
            },

            submit: Function,
            submitName: {
                type: String, default: '提交'
            },
            successInfo: String
        },
        components: {FormItem, Actions},
        data () {
            return {
                errors: {},
                formValue: {},
                formItems: []
            }
        },
        created () {
            this.formValue = this.value
            this.formItems = Form.normalizeItems(this.items)
        },
        methods: {

            doSubmit () {
                this.$emit('beforesubmit', this.formValue)
                this.loading = `正在${this.submitName}`
                if (this.submit) {
                    return this.submit()
                } else {
                    let action = this.method === 'post' ? this.$http.post : this.$http.put
                    return action(this.url, this.formValue).then(({data}) => {
                        return data
                    })
                }
            },
            canEdit(f) {
                return ! (f.widget instanceof Function)
            },
            genValuesWithFunctionWidget () {
                let d  = this.formValue
                this.formItems.filter(a => a.widget instanceof Function).forEach(a => {
                    d[a.name] = a.widget(d)
                })
            },
            onPosted(data){
                this.loading = false
                this.$message({message: this.successInfo || `${this.submitName}成功`, type: 'success'})
                this.$emit("form-posted", data)
                return data
            },
            onValidated (valid, notValidFields) {
                if (valid) {
                    this.errors = {}
                }
            },
            onSubmit () {
                this.genValuesWithFunctionWidget()
                return this.$refs.form.validate().then(this.onValidated).then(this.doSubmit).then(this.onPosted).catch(e => {
                        if (e === false) {
                            this.$message({message: '表单检验未通过，请按提示修改', type: 'error'})
                        } else {
                            let error = this.onServerResponseError(e)
                            if (error.code === 400) {
                                this.errors = Form.joinErrors(error.msg)
                            }
                        }
                    }
                )

            },

        },
        computed: {
            rules () {
                return Form.getItemRules(this.formItems)
            },

            _actions () {
                return this.actions || [{name: 'submit', label: this.submitName, do: this.onSubmit}]
            },
            elOptions () {
                return this.options.elForm || {}
            }
        },
        watch: {
            value(val){
                this.formValue = val
            },
            items (val) {
                this.formItems = Form.normalizeItems(val)
            }
        }
    }
</script>
<style scoped></style>
