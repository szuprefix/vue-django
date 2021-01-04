<template>

    <field v-if="field.widget === 'textarea'" v-model="value[field.name]" :maxlength="field.max_length"
           :show-word-limit="value[field.name] && value[field.name].length>field.max_length*0.8 || false"
           @change="fieldValueChanged" :placeholder="field.placeholder || [field.label, field.help_text].join('\n')"
           type="textarea" v-bind="[field]"></field>

    <field v-else-if="['text', 'input','password'].includes(field.widget)" v-model="value[field.name]"
           @change="fieldValueChanged" :maxlength="field.max_length" clearable
           :show-word-limit="value[field.name] && value[field.name].length>field.max_length*0.8 || false"
           :type="field.widget" v-bind="[field]">
        <i slot="left-icon" v-if="field.icon" :class="`fa fa-${field.icon}`"></i>
    </field>

    <component
            v-else-if="typeof field.widget === 'object'"
            v-model="value[field.name]"
            :is="field.widget"
            @change="fieldValueChanged"
            :placeholder="field.placeholder || field.label"
            :appModel="field.model"
            :field="field"
            :context="value"
            :ref="field.ref">
    </component>

    <field v-else v-bind="[field]">
        <template #input>
            <span v-if="field.widget === 'readonly'" style="white-space: pre-wrap">{{value[field.nameField || field.name]}}</span>
            <span v-else-if="typeof(field.widget) === 'function'" v-html="field.widget(value,field)"></span>

            <radio-group v-else-if="field.widget === 'radio'" v-model="value[field.name]" @change="fieldValueChanged">
                <van-radio :name="c.value" v-for="c in field.choices" :key="c.value">{{ c.display_name}}</van-radio>
            </radio-group>
            <choices v-else-if="field.widget === 'select'" v-model="value[field.name]" filterable allow-create
                     @change="fieldValueChanged" v-bind="[field]" :field="field">
            </choices>
            <switch v-else-if="field.widget === 'checkbox'" v-model="value[field.name]" @change="fieldValueChanged">
            </switch>
            <steper v-else-if="field.widget === 'steper'" v-model="value[field.name]" v-bind="[field]"
                    @change="fieldValueChanged">
            </steper>
            <date-picker v-else-if="['date','datetime'].includes(field.widget)" @change="fieldValueChanged"
                         v-model="value[field.name]" :type="field.widget" v-bind="[field]">
            </date-picker>


        </template>
    </field>

</template>
<script>
    import {RadioGroup, Radio as VanRadio, Switch, Stepper, Field} from 'vant'
    import Choices from './widgets/Choices.vue'
    export default {
        props: {
            value: Object,
            field: Object,
            context: Object
        },
        data() {
            return {}
        },
        created() {
        },
        components: {RadioGroup, VanRadio, Switch, Stepper, Field, Choices},
        methods: {
            fieldValueChanged(value) {
                let d = {
                    form: this.value,
                    field: this.field,
                    value,
                    context: this.context
                }
                if (this.field.onChanged) {
                    this.field.onChanged(d)
                }
                this.$emit('change', d)
            },
            doNothing(){
                console.log('do nothing')
            }
        },
        computed: {}
    }
</script>
