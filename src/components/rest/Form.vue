<template>

    <el-form ref="form" :inline="options.inline" :rules="rules" :model="form" v-if="form"
             label-position="right" :label-width="options.labelWidth || '20%'">
        <el-form-item :prop="f.name" :required="f.required" :label="f.label" :error="errors[f.name]"
                      :key="f.name" v-if="f.widget !== 'hidden'"
                      :ref="f.name" v-for="f in fieldItems" :style="options.itemStyle || {minWidth:'350px'}">
            <template slot="label">{{f.label}}
                <el-tooltip placement="top" v-if="f.help_text">
                    <div slot="content" v-html="f.help_text"></div>
                    <i class="fa fa-info-circle bg-info"></i>
                </el-tooltip>
            </template>
            <template>
                <el-radio-group v-model="form[f.name]" v-if="f.widget === 'radio'">
                    <el-radio-button :label="c[0]" v-for="c in f.choices" :key="c[0]">{{ c[1] }}
                    </el-radio-button>
                </el-radio-group>
                <el-select v-model="form[f.name]" :multiple="f.multiple" filterable
                           v-else-if="f.widget === 'select'">
                    <el-option :label="c[1]" :value="c[0]" v-for="c in f.choices" :key="c[0]"></el-option>
                </el-select>
                <el-switch v-model="form[f.name]" on-text="开" off-text="关"
                           v-else-if="f.widget === 'checkbox'">
                </el-switch>
                <el-input-number v-model="form[f.name]" v-else-if="f.widget === 'number'">
                </el-input-number>
                <el-date-picker v-model="form[f.name]" :type="f.widget"
                                v-else-if="['date','datetime'].includes(f.widget) ">
                </el-date-picker>
                <el-input v-model="form[f.name]" :autosize="options.textAreaSize || { minRows: 4, maxRows: 8}"
                          type="textarea"
                          v-else-if="f.widget === 'textarea'"></el-input>
                <el-input v-else v-model="form[f.name]"
                          :type="['password', 'textarea'].includes(f.widget)?f.widget:'text'"></el-input>
            </template>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="onSubmit">{{submitName}}</el-button>
        </el-form-item>
    </el-form>
</template>
<script>
    import server_response from '../../mixins/server_response'
    export default{
        mixins: [
            server_response
        ],
        props: {
            fieldItems: {
                type: Array,
                default: []
            },
            form: Object,
            options: {
                type: Object, default(){
                    return {}
                }
            },
            url: String
        },
        data () {
            return {
                errors: {},
                loading: false,
                model: {},
            }
        },
        created () {

        },
        components: {},
        methods: {

            getWidget (f) {
                return f.type == 'boolean' ? 'checkbox' : 'text'
            },
            submit () {
                this.$emit('beforesubmit', this.form)
                return this.$http.post(this.url, this.form).then(({data}) => {
                    this.$message({message: `${this.submitName}成功`, type: 'success'})
                    this.$emit("form-posted", data)
                    return data
                }).catch(this.onServerResponseError)

            },
            onSubmit () {
                this.$refs['form'].validate((valid) => {
                    if (valid) {
                        this.errors = {}
                        this.submit()
                    } else {
                        this.$message({message: '表单检验未通过，请按提示修改', type: 'error'})
                        return false
                    }
                })
            }

        },
        computed: {
            rules () {
                let d = {}
                let self = this
                Object.keys(this.fieldItems).forEach((i) => {
                    let f = this.fieldItems[i]
                    let n = f.name
                    let dt = {"CheckboxInput": Boolean}
                    let rs = d[n] = []
                    if (f.required) {
                        rs.push({
                            type: f.type,
                            required: true,
                            message: `不能为空`,
                            trigger: [].includes(f.widge) ? 'change' : 'blur'
                        })

                    }
                    if (f.min_length) {
                        rs.push({min: f.min_length, message: `长度最小为${f.min_length}`, trigger: 'change'})
                    }
                    if (f.max_length) {
                        rs.push({max: f.max_length, message: `长度最大为${f.max_length}`, trigger: 'change'})
                    }

                })
                return d

            },
            submitName () {
                return this.options.submitButtonText || '保存'
            }
        }
    }
</script>
<style scoped></style>
