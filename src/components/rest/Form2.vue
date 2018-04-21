<template>
    <el-form ref="form" :inline="formInline" :size="formSize" :model="formValue" v-if="value"
             :inline-message="formInline"
             label-position="right" :label-width="formNoLabel && '0px' || formLabelWidth"
             v-loading="loading"
             :element-loading-text="loading">

        <el-alert :title="formErrors.non_field_errors" type="error" v-if="formErrors.non_field_errors"
                  :closable="false"></el-alert>
        <el-row>
            <el-col :xs="f.span.xs" :sm="f.span.sm" :md="f.span.md" :xl="f.span.xl"
                    v-for="f in _formItems" :key="f.name" v-if="f.widget !== 'hidden'">
                <el-form-item :prop="f.name" :rules="f.rules" :label="f.label" :error="formErrors[f.name]"
                              :ref="f.name" :style="formNoLabel && {} || formItemStyle">
                    <template slot="label" v-if="!formNoLabel">{{f.label}}
                        <el-tooltip placement="top" v-if="f.help_text">
                            <div slot="content" v-html="f.help_text"></div>
                            <i class="fa fa-info-circle bg-info"></i>
                        </el-tooltip>
                    </template>
                    <template slot="label" v-else><span></span></template>
                    <template>
                        <el-radio-group v-model="formValue[f.name]" v-if="f.widget === 'radio'">
                            <el-radio-button :label="c[0]" v-for="c in f.choices" :key="c[0]">{{ c[1] }}
                            </el-radio-button>
                        </el-radio-group>
                        <el-select v-model="formValue[f.name]" :multiple="f.multiple" filterable allow-create
                                   :placeholder="`请选择${f.label}`" v-else-if="f.widget === 'select'">
                            <el-option :label="c[1]" :value="c[0]" v-for="c in f.choices" :key="c[0]"></el-option>
                        </el-select>
                        <el-switch v-model="formValue[f.name]" on-text="开" off-text="关"
                                   v-else-if="f.widget === 'checkbox'">
                        </el-switch>
                        <el-input-number v-model="formValue[f.name]" v-else-if="f.widget === 'number'">
                        </el-input-number>
                        <el-date-picker v-model="formValue[f.name]" :type="f.widget"
                                        :placeholder="f.label" v-else-if="['date','datetime'].includes(f.widget) ">
                        </el-date-picker>
                        <el-input v-model="formValue[f.name]"
                                  :autosize="formTextareaSize"
                                  :placeholder="[f.label, f.help_text].join('\n')" type="textarea"
                                  v-else-if="f.widget === 'textarea'"></el-input>
                        <component :is="formWidgets[f.widget]" v-else-if="f.widget in formWidgets"
                                   :placeholder="f.label" v-model="formValue[f.name]" :options="f"></component>
                        <el-input v-else v-model="formValue[f.name]" :placeholder="[f.label, f.help_text].join('\n')"
                                  :type="['password', 'textarea'].includes(f.widget)?f.widget:'text'"></el-input>
                    </template>
                </el-form-item>
            </el-col>
        </el-row>
        <slot name="submit">
            <el-form-item>
                <el-button type="primary" @click="onSubmit">{{formSubmitName}}</el-button>
            </el-form-item>
        </slot>
    </el-form>
</template>
<script>
    import form_view from '../../mixins/form_view'
    export default{
        mixins: [
            form_view
        ],
        props: {
            value: Object,
        }
    }
</script>
<style scoped></style>
