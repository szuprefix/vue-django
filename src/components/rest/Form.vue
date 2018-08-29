<template>
    <div>
        <el-form ref="form" :inline="formInline" :size="formSize" :model="formValue" v-if="value"
                 :inline-message="formInline"
                 label-position="right" :label-width="formNoLabel && '0px' || formLabelWidth"
                 v-loading="loading"
                 :element-loading-text="loading">
            <el-alert :title="formErrors.non_field_errors" type="error" v-if="formErrors.non_field_errors"
                      :closable="false"></el-alert>
            <el-row>
                <el-col :xs="f.span.xs" :sm="f.span.sm" :md="f.span.md" :lg="f.span.lg" :xl="f.span.xl"
                        v-for="f in _formItems" :key="f.name" v-if="f.widget !== 'hidden'">
                    <el-form-item :prop="f.name" :rules="f.rules" :label="f.label" :error="formErrors[f.name]"
                                  :ref="f.name" :style="formNoLabel && {} || formItemStyle">
                        <template slot="label" v-if="!formNoLabel">{{f.label}}
                            <el-tooltip placement="top" v-if="f.help_text">
                                <div slot="content" v-html="f.help_text"></div>
                                <i class="fa fa-info-circle bg-info" tabindex="-1"></i>
                            </el-tooltip>
                        </template>
                        <template slot="label" v-else><span></span></template>
                        <template>
                            <form-widget v-model="formValue" :field="f"></form-widget>
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
    </div>
</template>
<script>
    import form_view from '../../mixins/form_view'
    import FormWidget from '../widgets/FormWidget.vue'
    export default{
        mixins: [
            form_view
        ],
        props: {
            value: Object,
            formNoLabel: {
              type: Boolean,
              default: () => false
            }
        },
        components: {
            FormWidget
        },
        created(){
            this.formValue = this.value
        },
        watch: {
            value(val){
                this.formValue = val

            }
        }
    }
</script>
<style scoped></style>
