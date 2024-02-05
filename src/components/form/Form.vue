<template>
    <el-form ref="form" v-bind="[$props,$attrs]" :model="formValue" v-if="value"
             v-loading="loading" :element-loading-text="loading"
             :label-width="$attrs.labelWidth || $attrs.noLabel && '0px' || (!$attrs.inline && '160px')">

        <slot name="header"></slot>
        <el-alert :title="errors.non_field_errors" type="error" v-if="errors.non_field_errors"
                  :closable="false"></el-alert>
        <el-row>
            <template v-for="f in formItems">
                <template v-if="!f.hidden">
                    <el-col v-bind="[f.span]" :key="f.name" v-if="!$attrs.inline && !$attrs.oneColumn && f.widget !== 'hidden'">
                        <item :field="f" v-model="formValue" v-bind="$attrs.itemOptions" :error="errors[f.name]"></item>
                    </el-col>
                    <item :field="f" v-model="formValue" v-bind="$attrs.itemOptions" :error="errors[f.name]"
                          :key="f.name" v-else></item>
                </template>
            </template>
            <slot name="submit">
                <template v-if="submitName>''">
                    <el-col :xs="$attrs.inline?12:24" :sm="$attrs.inline?8:24" :md="$attrs.inline?6:24"
                            :lg="$attrs.inline?4:24"
                            :xl="$attrs.inline?3:24" v-if="!$attrs.inline">
                        <el-form-item>
                            <actions :items="_actions"></actions>
                        </el-form-item>
                    </el-col>
                    <el-form-item v-else>
                        <actions :items="_actions"></actions>
                    </el-form-item>
                </template>
            </slot>

            <slot name="footer"></slot>
        </el-row>
    </el-form>
</template>
<script>
    import ServerResponse from '../../mixins/server_response'
    import Item from './Item.vue'
    import Form from './Form'
    import Actions from '../layout/Actions.vue'
    export default{
        mixins: [
            ServerResponse
        ],
        props: {
            ...Form.defaultProps,
            submit: Function,
            successInfo: String
        },
        components: {Item, Actions},
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
                    return this.submit(this)
                } else {
                    let action = this.method === 'post' ? this.$http.post : this.$http.put
                    return action(this.url, this.formValue).then(({data}) => {
                        return data
                    })
                }
            },
            canEdit (f) {
                return !(f.widget instanceof Function)
            },
            genValuesWithFunctionWidget () {
                let d = this.formValue
                this.formItems.filter(a => a.widget instanceof Function).forEach(a => {
                    d[a.name] = a.widget(d)
                })
            },
            onPosted(data){
                this.loading = false
                if (data === false) {
                    return
                }
                this.$message({message: this.successInfo || `${this.submitName}成功`, type: 'success'})
                this.$emit('form-posted', data)
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
                return this.actions || [{
                        name: 'submit',
                        label: this.submitName,
                        do: this.onSubmit,
                        type: 'primary',
                        size: this.$attrs.size
                    }]
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

