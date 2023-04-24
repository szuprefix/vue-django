<template>
    <div>
        <template v-if="field.widget === 'readonly'">
            {{value[field.name]}}
        </template>

        <radio :title="field.label" v-model="value[field.name]" :required="field.required" :options="field.choices"
               :ref="field.name"
               v-if="field.widget === 'radio'"></radio>
        <selector :title="field.label" v-model="value[field.name]" :required="field.required"
                  v-else-if="field.widget === 'select'"></selector>
        <x-switch :title="field.label" v-model="value[field.name]" :required="field.required"
                  v-else-if="field.widget === 'checkbox'"></x-switch>
        <x-number :title="field.label" v-model="value[field.name]" :required="field.required"
                  v-else-if="field.widget === 'number'"></x-number>
        <datetime :title="field.label" v-model="value[field.name]" :required="field.required"
                  :format="field.widget=='datetime'?'YYYY-MM-DD HH:mm':'YYYY-MM-DD'"
                  v-else-if="field.widget in ['date','datetime']"></datetime>
        <x-textarea :title="field.label" v-model="value[field.name]" :required="field.required"
                    :placeholder="field.help_text" autosize
                    v-else-if="field.widget === 'textarea'"></x-textarea>
        <component :title="field.label" :is="extraWidgets[f.widget]" v-else-if="field.widget in extraWidgets"
                   v-model="value[field.name]"></component>
        <x-input :title="field.label" v-else v-model="value[field.name]" :required="field.required"
                 :placeholder="field.help_text"
                 :is-type="field.isType" :mask="field.mask" :max="field.max"
                 :type="field.widget in ['password']?f.widget:'text'"></x-input>
    </div>
</template>
<script>
    import {
        Group,
        Cell,
        XInput,
        XTextarea,
        XSwitch,
        Calendar,
        XNumber,
        Radio,
        XAddress,
        Selector,
        Datetime,
        XButton,
        Box
    } from 'vux'
    export default{
        props: {
            value: Object,
            field: Object
        },
        data () {
            return {}
        },
        created(){
//           console.log(this.field)
        },
        components: {
            Group,
            Cell,
            XInput,
            XTextarea,
            XSwitch,
            Calendar,
            XNumber,
            Radio,
            XAddress,
            Selector,
            Datetime,
            XButton,
            Box
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

