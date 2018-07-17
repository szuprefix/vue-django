<template>
    <div class="model-form">
        <el-alert :title="errors.__all__" type="error" v-if="errors.__all__" :closable="false"></el-alert>
        <el-form ref="form" :inline="options.inline" v-loading="loading" :rules="rules" :model="formData"
                 label-position="right" :label-width="options.labelWidth || '120px'">
            <el-form-item :prop="n" :required="form[n].required" :label="form[n].label" :error="errors[n]" :key="n"
                          :ref="n" v-for="v,n in formData" :style="options.itemStyle || {minWidth:'350px'}">
                <template slot="label">{{form[n].label}}
                    <info-popover v-if="form[n].help_text" :info="form[n].help_text">
                    </info-popover>
                </template>
                <template>
                    <el-radio-group v-model="formData[n]"
                                    v-if="form[n].widget === 'Select' && form[n].choices && form[n].choices.length<5">
                        <el-radio-button :label="c[0]" v-for="c in form[n].choices" :key="c[0]">{{ c[1] }}
                        </el-radio-button>
                    </el-radio-group>
                    <el-select v-model="formData[n]" filterable
                               v-else-if="form[n].widget === 'Select' && form[n].choices && form[n].choices.length>=5">
                        <el-option :label="c[1]" :value="c[0]" v-for="c in form[n].choices" :key="c[0]"></el-option>
                    </el-select>
                    <el-select v-model="formData[n]" :multiple="true" filterable v-else-if="form[n].widget === 'SelectMultiple'">
                        <el-option :label="c[1]" :value="c[0]" v-for="c in form[n].choices" :key="c[0]"></el-option>
                    </el-select>
                    <el-switch v-model="formData[n]" on-text="开" off-text="关"
                               v-else-if="form[n].widget === 'CheckboxInput'">
                    </el-switch>
                    <el-input-number v-model="formData[n]" v-else-if="form[n].widget === 'NumberInput'">
                    </el-input-number>
                    <el-date-picker v-model="formData[n]" :type="form[n].widget.indexOf('Time')>=0?'datetime':'date'"
                                    v-else-if="form[n].widget.indexOf('Date')>=0">
                    </el-date-picker>
                    <el-input v-model="formData[n]" :autosize="options.textAreaSize || { minRows: 4, maxRows: 8}"
                              type="textarea"
                              v-else-if="form[n].widget === 'Textarea'"></el-input>
                    <el-input v-else v-model="formData[n]"
                              :type="form[n].widget === 'PasswordInput'?'password':'text'"></el-input>
                </template>
            </el-form-item>
            <el-form-item label=" " v-if="formData">
                <el-button type="primary" @click="onSubmit">{{options.submitButtonText || '保存'}}</el-button>
            </el-form-item>
            <!--{{formData}}-->
        </el-form>
    </div>
</template>
<script>
    import server_response from '../../mixins/server_response'
    import Qs from 'qs'
    import { format } from 'date-fns'
    export default{
        props: {
            url: String,
            options: {
                type: Object, default(){
                    return {}
                }
            }
        },
        components: {
            InfoPopover: require("../layout/InfoPopover.vue")
        },
        mixins: [server_response],
        created (){
            this.$http.get(this.url).then(({data}) => {
                let form = data.data.form
                var d = {}
                Object.keys(form).forEach((n) => {
                    let f = form[n]
                    let v = f.value
                    if (this.getDataType(f) === 'array' && v instanceof String) {
                        if (v === '') {
                            v = []
                        } else {
                            v = v.split(',')
                        }
//                        form[n].value = v
                    }
                    if (f.choices !== undefined && f.choices.length === 1) {
                        v = f.choices[0][0]
                    }
                    d[n] = v
                })
                this.form = form
                this.formData = d
                this.$emit('loaded', data.data)
            }).catch(this.onServerResponseError)
        },
        data () {
            return {
                formData: null,
                form: {},
                errors: {}
            }
        },
        computed: {
            rules: function () {
                var d = {}
                var self = this
                Object.keys(this.form).forEach(function (n) {
                    let f = self.form[n]
                    let dt = {"CheckboxInput": Boolean}
                    var rs = d[n] = []
                    if (f.required) {
                        rs.push({type: self.getDataType(f), required: true, message: `不能为空`, trigger: 'change'})

                    }
                    if (f.min_length) {
                        rs.push({min: f.min_length, message: `长度最小为${f.min_length}`, trigger: 'change'})
                    }
                    if (f.max_length) {
                        rs.push({max: f.max_length, message: `长度最大为${f.max_length}`, trigger: 'change'})
                    }

                })
                return d

            }
        },
        methods: {
            isNormalType(t){
                if (t === undefined) {
                    return undefined
                }
                let dt = t.replace(/Field|Positive|Long|Small/g, '').toLowerCase()
                if (['integer', 'boolean', 'email', 'date', 'time', 'datetime'].indexOf(dt) >= 0) {
                    return dt
                }
            },
            getDataType(f){
                if (f.type === 'ModelChoiceField') {
                    return 'integer'
                } else if (f.widget === 'SelectMultiple') {
                    return 'array'
                }
                return this.isNormalType(f.dbtype) || this.isNormalType(f.type) || 'string'
            },
            submit () {
                this.formPost(this.url, this.getSubmitData(), ({data}) => {
                    this.$store.state.bus.$emit("model-posted", data)
                    this.$emit("form-posted", data)
                })
            },
            onSubmit () {
                this.$refs['form'].validate((valid) => {
                    if (valid) {
                        this.submit()
                    } else {
                        this.$message({message: '表单检验未通过，请按提示修改', type: 'error'})
                        return false;
                    }
                })
            },
            getSubmitData(){
                let r = {}
                Object.keys(this.formData).forEach((n) => {
                    let dt = this.getDataType(this.form[n])
                    let v = this.formData[n]
                    if (v instanceof Date) {
                        if (dt === 'date') {
                            r[n] = format(v, 'YYYY-MM-DD')
                        } else if (dt === 'datetime') {
                            r[n] = format(v, 'YYYY-MM-DD HH:mm:ss')
                        }
                    } else {
                        r[n] = v
                    }
                })
                return r
            }
        }
    }
</script>
<style>
</style>