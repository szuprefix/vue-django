<template>
    <van-form @submit="onSubmit" v-on="$listeners">
        <van-cell-group :title="g.name" v-for="g in formGroups" :key="g.name">
            <template v-for="field in g.items">
                <widget v-model="formValue" :field="field" :key="field.name"></widget>
            </template>
        </van-cell-group>
        <div style="margin: 16px;" v-if="method">
            <van-button block :loading="loading" :disabled="loading" :loading-text='loading' type="info"
                        native-type="submit">
                {{submitName}}
            </van-button>
        </div>
        <notice-bar v-if="errors.non_field_errors">{{errors.non_field_errors}}</notice-bar>
    </van-form>
</template>
<script>
    //    import Form from '../../form/Form'
    import FormMixin from '../../form/FormMixin'
    import Widget from './Widget.vue'
    //    import ServerResponse from 'vue-django/src/mixins/server_response'
    import {
        Form as VanForm,
        Button as VanButton,
        Field,
        NoticeBar,
        CellGroup as VanCellGroup
    } from 'vant'
    export default{
        mixins: [FormMixin],
        props: {
//            ...Form.defaultProps,
            procedure: Function
        },
        components: {
            VanForm,
            VanButton,
//            Field,
            Widget,
            NoticeBar,
            VanCellGroup
        },
        data () {
            return {
                errors: {},
                formValue: {},
                formItems: []
            }
        },
        created () {
//            console.log(this.$listeners)
//            this.formValue = this.value
//            this.formItems = Form.normalizeItems(this.items)
        },
        methods: {

            doSubmit () {
                this.$emit('beforesubmit', this.formValue)
                this.loading = `正在${this.submitName}`
                if (this.procedure) {
                    return this.procedure()
                } else {
                    let action = this.method === 'post' ? this.$http.post : this.$http.put
                    return action(this.url, this.formValue).then(({data}) => {
                        return data
                    })
                }
            },
            onPosted(data){
                this.loading = false
                this.$message({message: this.successInfo || `${this.submitName}成功`, type: 'success'})
                this.$emit('form-posted', data)
                return data
            },
            showError (field) {
                this.$message({message: this.formErrors[field.name], type: 'error'})
            },
            normalizeOptions (choices) {
                let ops = choices.map(a => {
                    if (typeof a === 'string') {
                        return {key: a, value: a}
                    }
                    return {key: a.value, value: a.display_name}
                })
                return ops
            },
            onSubmit() {
                this.doSubmit().then(this.onPosted).catch(e => {
//                        this.loading = false
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

            }
        },
        computed: {},
        watch: {
//            value(val){
//                this.formValue = val
//            },
//            formErrors (val) {
//                if ((val instanceof Object) && !(val instanceof Array)) {
//                    Object.keys(val).forEach(k => {
//                        let f = this.$refs[k][0]
//                        f.$data.errors.invalid = val[k]
//                        f.$data.valid = false
//                    })
//                }
//            },
//            items(){
//                this.formItems = Form.normalizeItems(this.items)
//            }
        }
    }
</script>

