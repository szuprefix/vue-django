<template>
    <div class="form-field">
        <!--{{field}}-->
        <template v-if="field.widget === 'readonly'">
          {{value[field.name]}}
        </template>
        <el-radio-group v-model="value[field.name]" v-else-if="field.widget === 'radio'" @change="fieldValueChanged">
            <el-radio-button :label="c.value" v-for="c in field.choices" :key="c.value">{{ c.display_name}}
            </el-radio-button>
        </el-radio-group>
        <el-select v-model="value[field.name]" :multiple="field.multiple" filterable allow-create  @change="fieldValueChanged"
                   :placeholder="`请选择${field.label}`" v-else-if="field.widget === 'select'">
            <el-option :label="c.display_name" :value="c.value" v-for="c in field.choices" :key="c.value"></el-option>
        </el-select>
        <el-switch v-model="value[field.name]" on-text="开" off-text="关"
                   v-else-if="field.widget === 'checkbox'" @change="fieldValueChanged">
        </el-switch>
        <el-input-number v-model="value[field.name]" v-else-if="field.widget === 'number'" :controls="field.type === 'integer'" @change="fieldValueChanged">
        </el-input-number>
        <el-date-picker v-model="value[field.name]" :type="field.widget"
                        :placeholder="field.label" v-else-if="field.widget == 'date' " @change="fieldValueChanged">
        </el-date-picker>
        <el-date-picker v-model="value[field.name]" :type="field.widget"  value-format="yyyy-MM-ddTHH:mm:ssZ"
                        :placeholder="field.label" v-else-if="field.widget == 'datetime' " @change="fieldValueChanged">
        </el-date-picker>
        <el-time-select v-model="value[field.name]" v-else-if="field.widget == 'time'" :picker-options="field.pickerOptions || {
    start: '00:00',
    step: '00:30',
    end: '23:59'
  }"></el-time-select>
        <el-input v-model="value[field.name]"
                  :autosize="field.autosize || {minRows: 8, maxRows: 24}"  @change="fieldValueChanged"
                  :placeholder="[field.label, field.help_text].join('\n')" type="textarea"
                  v-else-if="field.widget === 'textarea'"></el-input>
        <component :is="field.widget" v-else-if="typeof field.widget == 'object'"  @change="fieldValueChanged"
                   :placeholder="field.label" v-model="value[field.name]" :field="field"></component>
        <el-input v-else v-model="value[field.name]" :placeholder="[field.label, field.help_text].join('\n')"  @change="fieldValueChanged"
                  :type="['password', 'textarea'].includes(field.widget)?field.widget:'text'"></el-input>
    </div>
</template>
<script>
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
        components: {},
        methods: {
            fieldValueChanged(value){
                if(this.field.onChanged){
                    this.field.onChanged({form:this.value,field:this.field,value})
                }
            }
        },
        computed: {}
    }
</script>

<style>
    .form-field .related-select {
        width: 24rem;
    }
    @media screen and (max-width:1920px ) {
        .form-field .related-select {
            width: 18rem;
        }
    }
    @media screen and (max-width:1200px ) {
        .form-field .related-select {
            width: 12rem;
        }
    }
    @media screen and (max-width:992px ) {
        .form-field .related-select {
            width: 24rem;
        }
    }
</style>
