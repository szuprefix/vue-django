<template>
    <div class="form">
        <group ref="form" :title="title">
            <template v-if="field.widget !== 'hidden'" v-for="field in formItems">
                <template v-if="field.widget === 'readonly'">
                    {{formValue[field.name]}}
                </template>

                <radio :title="field.label" v-model="formValue[field.name]" :required="field.required"
                       :options="field.choices"
                       :ref="field.name"
                       v-if="field.widget === 'radio'"></radio>
                <selector :title="field.label" v-model="formValue[field.name]" :required="field.required"
                          :ref="field.name"
                          v-else-if="field.widget === 'select'"></selector>
                <x-switch :title="field.label" v-model="formValue[field.name]" :required="field.required"
                          :ref="field.name"
                          v-else-if="field.widget === 'checkbox'"></x-switch>
                <x-number :title="field.label" v-model="formValue[field.name]" :required="field.required"
                          :ref="field.name"
                          v-else-if="field.widget === 'number'"></x-number>
                <datetime :title="field.label" v-model="formValue[field.name]" :required="field.required"
                          :ref="field.name"
                          :format="field.widget=='datetime'?'YYYY-MM-DD HH:mm':'YYYY-MM-DD'"
                          v-else-if="['date','datetime'].includes(field.widget)"></datetime>
                <x-textarea :title="field.label" v-model="formValue[field.name]" :required="field.required"
                            :ref="field.name"
                            :placeholder="field.help_text"
                            v-else-if="field.widget === 'textarea'"></x-textarea>
                <component :is="field.widget" v-else-if="typeof field.widget == 'object'"
                           :ref="field.name"
                           :placeholder="field.label" v-model="formValue[field.name]" :field="field"></component>
                <x-input :title="field.label" v-else v-model="formValue[field.name]" :required="field.required"
                         :placeholder="field.help_text" :equal-with="field.equalWith"
                         :icon-type="formErrors[field.name]?'error':null"
                         :ref="field.name" :keyboard="field.keyboard" @on-click-error-icon="showError(field)"
                         :is-type="field.isType" :mask="field.mask" :max="field.max"
                         :type="field.widget == 'password'?field.widget:'text'"></x-input>
            </template>
        </group>
        <box gap="10px 10px">
            <x-button type="primary" @click.native="onSubmit">{{formSubmitName}}</x-button>
            <div v-if="formErrors.non_field_errors" class="weui-cell_warn">{{formErrors.non_field_errors}}</div>
        </box>
    </div>
</template>
<script>
    import formView from '../../mixins/form_view'
    import {
        Group,
        Cell,
        XInput,
        XTextarea,
        XSwitch,
        XNumber,
        Radio,
        Selector,
        Datetime,
        XButton,
        Box
    } from 'vux'
    export default{
        mixins: [
            formView
        ],

        props: {
            value: Object,
            title: String
        },
        components: {
            Group,
            Cell,
            XInput,
            XTextarea,
            XSwitch,
            XNumber,
            Radio,
            Selector,
            Datetime,
            XButton,
            Box
        },
        created () {
            this.formValue = this.value
        },
        methods: {
            showError (field) {
                this.$message({message: this.formErrors[field.name], type: 'error'})
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

