<template>
    <span v-if="field.widget === 'readonly'" style="white-space: pre-wrap"><a v-if="isLink(value[field.name])" :href="value[field.name]" target="_blank">{{value[field.name]}}</a><template v-else>{{value[field.name]}}</template></span>
    <span v-else-if="typeof(field.widget) === 'function'" v-html="field.widget(value,field)"></span>
    <el-radio-group v-model="value[field.name]" v-else-if="field.widget === 'radio'" @change="fieldValueChanged"
                    :disabled="field.disabled">
        <el-radio-button :label="c.value" v-for="c in normalizeChoices(field.choices)" :key="c.value">{{ c.display_name}}
        </el-radio-button>
    </el-radio-group>
    <el-select v-model="value[field.name]" :multiple="field.multiple" filterable allow-create
               :disabled="field.disabled" @context="onContext"
               @change="fieldValueChanged" :placeholder="field.placeholder || `请选择${field.label}`"
               v-else-if="field.widget === 'select'">
        <el-option :label="c.display_name" :value="c.value" v-for="c in normalizeChoices(field.choices)" :key="c.value"></el-option>
    </el-select>
    <el-switch v-model="value[field.name]" v-else-if="field.widget === 'switch'"
               @change="fieldValueChanged" v-bind="[field]">
    </el-switch>
    <el-input-number v-model="value[field.name]" v-else-if="field.widget === 'number'" v-bind="[field]"
                   controls-position="right"  :controls="field.type === 'integer'" @change="fieldValueChanged">
    </el-input-number>
    <el-date-picker v-model="value[field.name]" :type="field.widget" :value-format="field.widget === 'date' ? 'yyyy-MM-dd': 'yyyy-MM-ddTHH:mm:ss'"
                    :placeholder="field.placeholder || field.label" :readonly="field.read_only"
                    v-else-if="['date','datetime'].includes(field.widget)"
                    @change="fieldValueChanged" :disabled="field.disabled">
    </el-date-picker>
    <el-time-select v-model="value[field.name]" v-else-if="field.widget == 'time'" :picker-options="field.pickerOptions || {
    start: '00:00',
    step: '00:30',
    end: '23:59'
  }" :disabled="field.disabled"></el-time-select>
    <el-input v-model="value[field.name]" :autosize="field.autosize || {minRows: 4, maxRows: 12}"
              :maxlength="field.max_length"
              :show-word-limit="value[field.name] && value[field.name].length>field.max_length*0.8 || false"
              @change="fieldValueChanged"
              :placeholder="field.placeholder || [field.label, field.help_text].join('\n')" type="textarea"
              v-else-if="field.widget === 'textarea'" :disabled="field.disabled"></el-input>

    <component
            v-else-if="typeof field.widget == 'object'"
            v-model="value[field.name]"
            :is="field.widget"
            @change="fieldValueChanged"
            @context="onContext"
            :placeholder="field.placeholder || field.label"
            :appModel="field.model"
            :field="field"
            :context="value"
            :ref="field.ref">
    </component>

    <el-input v-else v-model="value[field.name]"
              :placeholder="field.placeholder || [field.label, field.help_text].join('\n')"
              @change="fieldValueChanged" :maxlength="field.max_length"
              :show-word-limit="value[field.name] && value[field.name].length>field.max_length*0.8 || false"
              :show-password="field.widget === 'password'"
              :type="['password', 'textarea'].includes(field.widget)?field.widget:'text'"
              :disabled="field.disabled">
        <i slot="prefix" v-if="field.icon" :class="`fa fa-${field.icon}`"></i>
        <i slot="suffix" v-if="isLink(value[field.name])" :class="`fa fa-link`" style="cursor: pointer" title="点击跳转" @click="goLink"></i>
    </el-input>
</template>
<script>
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
//                       console.log(this.field)
        },
        components: {},
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
            onContext(ctx) {

                if (this.field.onContext) {
                    this.field.onContext(ctx)
                }
            },
            normalizeChoices(choices) {
                return choices.map(a => {
                    if(typeof a === 'string'){
                        return {value: a, display_name:a}
                    } else  if (a instanceof Array){
                        return {value: a[0], display_name: a[1]}
                    }
                    return a
                })
            },
            doNothing(){
                console.log('do nothing')
            },
            isLink(v) {
                return v && (typeof v === 'string') && (v.startsWith('http://') || v.startsWith('https://'))
            },
            goLink() {
                window.open(this.value[this.field.name])
            }
        },
        computed: {}
    }
</script>

<style>
    .related-select {
        width: 24rem;
    }

    @media screen and (max-width: 1920px) {
        .related-select {
            width: 18rem;
        }
    }

    @media screen and (max-width: 1200px) {
        .related-select {
            width: 12rem;
        }
    }

    @media screen and (max-width: 992px) {
        .related-select {
            width: 24rem;
        }
    }
</style>
