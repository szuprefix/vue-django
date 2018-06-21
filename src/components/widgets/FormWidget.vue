<template>
    <div>
        <!--{{field}}-->
        <template v-if="field.widget === 'readonly'">
          {{value[field.name]}}
        </template>
        <el-radio-group v-model="value[field.name]" v-else-if="field.widget === 'radio'" @change="fieldValueChanged">
            <el-radio-button :label="c[0]" v-for="c in field.choices" :key="c[0]">{{ c[1] }}
            </el-radio-button>
        </el-radio-group>
        <el-select v-model="value[field.name]" :multiple="field.multiple" filterable allow-create  @change="fieldValueChanged"
                   :placeholder="`请选择${field.label}`" v-else-if="field.widget === 'select'">
            <el-option :label="c[1]" :value="c[0]" v-for="c in field.choices" :key="c[0]"></el-option>
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
        <el-input v-model="value[field.name]"
                  :autosize="textareaSize"  @change="fieldValueChanged"
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
            field: Object,
            textareaSize: {
                type: Object, default(){
                    return {minRows: 4, maxRows: 8}
                }
            }
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
<style scoped></style>
