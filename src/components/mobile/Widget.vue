<template>
    <!--<div>-->

    <popup-radio :title="field.label" v-if="field.widget === 'radio'" v-model="value[field.name]"
                 :placeholder="field.placeholder || field.help_text || `请输入${field.label}`"
                 :required="field.required" :options="normalizeOptions(field.choices)" :ref="field.name">
        <p slot="popup-header" class="vux-1px-b form-popup-radio-header">
            {{field.help_text || field.placeholder || field.label}}</p>
    </popup-radio>
    <checker :title="field.label" v-model="value[field.name]" :required="field.required"
             :ref="field.name" v-else-if="field.widget === 'checker'">
        <checker-item v-for="c in field.choices" :key="c.value" :value="c.value">{{c.display_name}}
        </checker-item>
    </checker>
    <selector v-bind="[field]" :title="field.label" v-model="value[field.name]"
              :ref="field.name" :options="normalizeOptions(field.choices)"
              v-else-if="field.widget === 'select'"></selector>
    <x-switch v-bind="[field]" :title="field.label" v-model="value[field.name]"
              :ref="field.name"
              v-else-if="field.widget === 'checkbox'"></x-switch>
    <x-number v-bind="[field]" :title="field.label" v-model="value[field.name]"
              :ref="field.name" @input="fieldValueChanged"
              v-else-if="field.widget === 'number'"></x-number>
    <datetime v-bind="[field]" :title="field.label" v-model="value[field.name]"
              :ref="field.name"
              :format="field.widget=='datetime'?'YYYY-MM-DD HH:mm':'YYYY-MM-DD'"
              v-else-if="['date','datetime'].includes(field.widget)"></datetime>
    <x-textarea v-bind="[field]" :title="field.label" v-model="value[field.name]"
                :ref="field.name" :placeholder="field.help_text"
                v-else-if="field.widget === 'textarea'"></x-textarea>
    <popup-picker v-bind="[field]" :title="field.label" v-model="value[field.name]"
                  :ref="field.name" :data="field.choices" :placeholder="field.help_text"
                  v-else-if="field.widget === 'popup-picker'"></popup-picker>

    <component :is="field.widget" v-else-if="typeof field.widget == 'object'"
               :ref="field.name" @change="fieldValueChanged"
               :placeholder="field.label" v-model="value[field.name]" :field="field"></component>
    <x-input v-bind="[field]" :title="field.label" v-else v-model="value[field.name]"
             :placeholder="field.placeholder || field.help_text || `请输入${field.label}`"
             :icon-type="formErrors[field.name]?'error':null"
             :ref="field.name" @on-click-error-icon="showError(field)"
             :type="field.widget === 'password'?field.widget:'text'"></x-input>
    <!--</div>-->
</template>
<script>
    import {
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
        name: 'FormWidget',
        componentName: 'FormWidget',
        props: {
            value: Object,
            field: Object,
            context: Object
        },
        data () {
            return {}
        },
        created(){
//           console.log(this.field)
        },
        components: {
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
            fieldValueChanged(value){
                if (this.field.onChanged) {
                    this.field.onChanged({form: this.value, field: this.field, value})
                }
            }
        },
        computed: {}
    }
</script>

