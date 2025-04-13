<template>
    <group ref="form" :title="title" class="form-group">
        <template v-if="field.widget !== 'hidden' && typeof(field.widget) !== 'function'" v-for="field in formItems">
            <template v-if="field.widget === 'readonly'">
                {{formValue[field.name]}}
            </template>
            <form-widget :field="field"  v-model="value" :error="errors[field.name]"></form-widget>
        </template>
    </group>
</template>
<script>
    import Form from '../../form/Form.js'
    import {
        Group,
        Cell,
        XInput,
        XTextarea,
        XSwitch,
        XNumber,
        PopupRadio,
        Checker,
        CheckerItem,
        Selector,
        Datetime,
        XButton,
        PopupPicker
    } from 'vux'
    import FormWidget from "../Widget";
    export default{
        name: 'FormGroup',

        componentName: 'FormGroup',
        props: {
            ...Form.defaultProps,
            title: String
        },
        data () {
            return {
                errors: {},
                formValue: {},
                formItems: []
            }
        },
        components: {
            FormWidget,
            Group,
            Cell,

            XInput,
            XTextarea,
            XSwitch,
            XNumber,
            PopupRadio,
            Checker,
            CheckerItem,
            Selector,
            Datetime,
            XButton,
            PopupPicker
        },
        created () {
            this.formValue = this.value
            this.formItems = Form.normalizeItems(this.items)
            this.$on('form-error', this.onFormError)
        },
        methods: {

            genValuesWithFunctionWidget () {
                let d = this.formValue
                this.formItems.filter(a => a.widget instanceof Function).forEach(a => {
                    d[a.name] = a.widget(d)
                })
            },
            onValidated (valid, notValidFields) {
                if (valid) {
                    this.errors = {}
                }
            },
            fieldValueChanged(value) {
                let d = {
                    form: this.value,
                    field: this.field,
                    value
                }
                if (this.field.onChanged) {
                    this.field.onChanged(d)
                }
                this.$emit('change', d)
            },
            onFormError(errors) {
                this.errors = {...errors}
                var fs = this.$refs
                errors.forEach((f) => {
                    let v = fs[f.field] && fs[f.field][0]
                    if (!v) {
                        return
                    }
                    // v.focus() && v.blur()
                    try {
                        if (v.onBlur) {
                            v.onBlur()
                        }
                    } catch (error) {
                        console.error(error)
                    }
                })
            }
        },
        computed: {
            rules () {
                return Form.getItemRules(this.formItems)
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
