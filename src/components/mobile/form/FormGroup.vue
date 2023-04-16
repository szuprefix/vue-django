<template>
    <group ref="form" :title="title" class="form-group">
        <template v-if="field.widget !== 'hidden' && typeof(field.widget) !== 'function'" v-for="field in formItems">
            <template v-if="field.widget === 'readonly'">
                {{formValue[field.name]}}
            </template>

            <popup-radio v-bind="[field]" :title="field.label" v-else-if="field.widget === 'radio'"
                         v-model="formValue[field.name]"
                         :placeholder="field.placeholder || field.help_text || `请输入${field.label}`"
                         :options="normalizeOptions(field.choices)"
                         :ref="field.name">
                <p slot="popup-header" class="vux-1px-b form-popup-radio-header">
                    {{field.help_text || field.placeholder || field.label}}</p>
            </popup-radio>
            <checker v-bind="[field]" :title="field.label" v-model="formValue[field.name]"
                     :ref="field.name" v-else-if="field.widget === 'checker'">
                <checker-item v-for="c in field.choices" :key="c.value" :value="c.value">{{c.display_name}}
                </checker-item>
            </checker>
            <selector v-bind="[field]" :title="field.label" v-model="formValue[field.name]"
                      :ref="field.name" :options="normalizeOptions(field.choices)"
                      v-else-if="field.widget === 'select'"></selector>
            <x-switch v-bind="[field]" :title="field.label" v-model="formValue[field.name]"
                      :ref="field.name"
                      v-else-if="field.widget === 'checkbox'"></x-switch>
            <x-number v-bind="[field]" :title="field.label" v-model="formValue[field.name]"
                      v-else-if="field.widget === 'number'" :ref="field.name"></x-number>
            <datetime :title="field.label" v-model="formValue[field.name]" :required="field.required"
                      :ref="field.name"
                      :format="field.widget=='datetime'?'YYYY-MM-DD HH:mm':'YYYY-MM-DD'"
                      v-else-if="['date','datetime'].includes(field.widget)"></datetime>
            <x-textarea v-bind="[field]" :title="field.label" v-model="formValue[field.name]"
                        :ref="field.name" :placeholder="field.help_text"
                        v-else-if="field.widget === 'textarea'"></x-textarea>
            <popup-picker v-bind="[field]" :title="field.label" v-model="formValue[field.name]"
                          :ref="field.name" :data="field.choices" :placeholder="field.help_text" :columns="2"
                          v-else-if="field.widget === 'popup-picker'"></popup-picker>

            <component :is="field.widget" v-else-if="typeof field.widget == 'object'"
                       :ref="field.name" v-bind="[field]"
                       :placeholder="field.label" v-model="formValue[field.name]" :field="field"></component>
            <x-input v-bind="[field]" :title="field.label" v-else v-model="formValue[field.name]"
                     :placeholder="field.placeholder || field.help_text || `请输入${field.label}`"
                     :equal-with="field.equalWith"
                     :icon-type="errors[field.name]?'error':null"
                     :ref="field.name" :keyboard="field.keyboard" @on-click-error-icon="showError(field)"
                     :is-type="field.isType" :mask="field.mask" :max="field.max"
                     :type="field.widget == 'password'?field.widget:'text'"></x-input>
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
            normalizeOptions (choices) {
                let ops = choices.map(a => {
                    if (typeof a === 'string') {
                        return {key: a, value: a}
                    } else if (a instanceof Array) {
                        return {key: a[0], value: a[1] || a[0]}
                    }
                    return {key: a.value, value: a.display_name}
                })
                return ops
            },
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
