<template>
    <el-form ref="form" :inline="options.inline" :size="options.size" :rules="rules" :model="values" v-if="values"
             :inline-message="options.inline"
             label-position="right" :label-width="options.noLabel && '0px' || options.labelWidth || '160px'"
             v-loading="loading"
             :element-loading-text="loading">

        <el-alert :title="errors.non_field_errors" type="error" v-if="errors.non_field_errors"
                  :closable="false"></el-alert>
        <el-row>
        <el-col :span="f.span || 24" v-for="f in fieldItems" :key="f.name" v-if="f.widget !== 'hidden'">
        <el-form-item :prop="f.name" :required="f.required" :label="f.label" :error="errors[f.name]"

                      :ref="f.name"
                      :style="options.noLabel && {} || options.itemStyle || {minWidth:'350px'}">
            <template slot="label" v-if="!options.noLabel">{{f.label}}
                <el-tooltip placement="top" v-if="f.help_text">
                    <div slot="content" v-html="f.help_text"></div>
                    <i class="fa fa-info-circle bg-info"></i>
                </el-tooltip>
            </template>
            <template slot="label" v-else><span></span></template>
            <template>
                <el-radio-group v-model="values[f.name]" v-if="f.widget === 'radio'">
                    <el-radio-button :label="c[0]" v-for="c in f.choices" :key="c[0]">{{ c[1] }}
                    </el-radio-button>
                </el-radio-group>
                <el-select v-model="values[f.name]" :multiple="f.multiple" filterable allow-create
                           :placeholder="`请选择${f.label}`" v-else-if="f.widget === 'select'">
                    <el-option :label="c[1]" :value="c[0]" v-for="c in f.choices" :key="c[0]"></el-option>
                </el-select>
                <el-switch v-model="values[f.name]" on-text="开" off-text="关"
                           v-else-if="f.widget === 'checkbox'">
                </el-switch>
                <el-input-number v-model="values[f.name]" v-else-if="f.widget === 'number'">
                </el-input-number>
                <el-date-picker v-model="values[f.name]" :type="f.widget"
                                :placeholder="f.label" v-else-if="['date','datetime'].includes(f.widget) ">
                </el-date-picker>
                <el-input v-model="values[f.name]" :autosize="options.textAreaSize || { minRows: 4, maxRows: 8}"
                          :placeholder="[f.label, f.help_text].join('\n')" type="textarea" v-else-if="f.widget === 'textarea'"></el-input>
                <component :is="extraWidgets[f.widget]" v-else-if="f.widget in extraWidgets"
                           :placeholder="f.label" v-model="values[f.name]" :options="f"></component>
                <el-input v-else v-model="values[f.name]" :placeholder="[f.label, f.help_text].join('\n')"
                          :type="['password', 'textarea'].includes(f.widget)?f.widget:'text'"></el-input>
            </template>
        </el-form-item>
        </el-col></el-row>
        <slot name="submit">
            <el-form-item>
                <el-button type="primary" @click="onSubmit">{{submitName}}</el-button>
            </el-form-item>
        </slot>
    </el-form>
</template>
<script>
    import form from '../../mixins/form'
    export default{
        mixins: [
            form
        ]
    }
</script>
<style scoped></style>
