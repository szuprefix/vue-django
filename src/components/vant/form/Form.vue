<template>
    <van-form>
        <template v-if="field.widget !== 'hidden'" v-for="field in formItems">
            <template v-if="field.widget === 'readonly'">
                {{formValue[field.name]}}
            </template>
            <field  v-model="formValue[field.name]"  v-else v-bind="[field]" :placeholder="field.placeholder || `请输入${field.label}`" :rules="formRules[field.name]" clearable></field>
        </template>
        <div style="margin: 16px;">
            <van-button round block type="info" native-type="button"  @click.native="onSubmit">
                {{formSubmitName}}
            </van-button>
        </div>
    </van-form>
</template>
<script>
    import formView from '../../../mixins/form_view'
    import {
        Form as VanForm,
        Button as VanButton,
        Field
    } from 'vant'
    export default{
        mixins: [
            formView
        ],

        props: {
            value: Object,
            title: String
        },
        components: {
            VanForm,
            VanButton,
            Field
        },
        data () {
            return {
                userName: ''
            }
        },
        created () {
            this.formValue = this.value
        },
        methods: {
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
            }
        },
        watch: {
            value (val) {
                this.formValue = val
            },
            formErrors (val) {
                if ((val instanceof Object) && !(val instanceof Array)) {
                    Object.keys(val).forEach(k => {
                        let f = this.$refs[k][0]
                        f.$data.errors.invalid = val[k]
                        f.$data.valid = false
                    })
                }
            }
        }
    }
</script>

