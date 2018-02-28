<template>
    <div class="model-form" v-loading="loading">
        <el-alert :title="errors.__all__" type="error" v-if="errors.__all__" :closable="false"></el-alert>
        <el-form ref="form" :inline="options.inline" v-loading="loading" :rules="rules" :model="values"
                 label-position="right" :label-width="options.labelWidth || '120px'">
            <el-form-item label=" " v-if="fieldItems" class="flex-right">
                <el-button type="primary" @click="onSubmit">{{submitName}}</el-button>
            </el-form-item>
            <el-form-item :prop="f.name" :required="f.required" :label="f.label" :error="errors[f.name]"
                          :key="f.name" v-if="f.widget !== 'hidden'"
                          :ref="f.name" v-for="f in fieldItems" :style="options.itemStyle || {minWidth:'350px'}">
                <template slot="label">{{f.label}}
                    <info-popover v-if="f.help_text" :info="f.help_text">
                    </info-popover>
                </template>
                <template>
                    <el-radio-group v-model="values[f.name]" v-if="f.widget === 'radio'">
                        <el-radio-button :label="c[0]" v-for="c in f.choices" :key="c[0]">{{ c[1] }}
                        </el-radio-button>
                    </el-radio-group>
                    <el-select v-model="values[f.name]" :multiple="f.multiple" filterable
                               v-else-if="f.widget === 'select'">
                        <el-option :label="c[1]" :value="c[0]" v-for="c in f.choices" :key="c[0]"></el-option>
                    </el-select>
                    <el-switch v-model="values[f.name]" on-text="开" off-text="关"
                               v-else-if="f.widget === 'checkbox'">
                    </el-switch>
                    <el-input-number v-model="values[f.name]" v-else-if="f.widget === 'number'">
                    </el-input-number>
                    <el-date-picker v-model="values[f.name]" :type="f.widget"
                                    v-else-if="f.widget in ['date','datetime']">
                    </el-date-picker>
                    <el-input v-model="values[f.name]" :autosize="options.textAreaSize || { minRows: 4, maxRows: 8}"
                              type="textarea"
                              v-else-if="f.widget === 'textarea'"></el-input>
                    <dimensions-input v-model="values[f.name]"
                                      v-else-if="f.widget === 'dimensions'"></dimensions-input>
                    <el-input v-else v-model="values[f.name]"
                              :type="f.widget in ['password', 'textarea']?f.widget:'text'"></el-input>
                </template>
            </el-form-item>
            <!--{{fieldItems}}-->
        </el-form>
    </div>
</template>
<script>
    import InfoPopover from '../InfoPopover.vue'
    import server_response from '../../mixins/server_response'
    import DimensionsInput from '../forecast/DimensionsInput.vue'
    export default{
        mixins: [
            server_response
        ],
        props: {
            appModel: Object,
            id: [String, Number],
            fields: {
                type: Array,
                default: []
            },
            fieldOptions: {
                type: Object,
                default: {}
            },
            options: {
                type: Object, default(){
                    return {}
                }
            }
        },
        data () {
            return {
                rest_options: {},
                errors: {},
                values: {},
//                fieldItems: {},
                loading: false
            }
        },
        created () {
            this.loading = true
            this.$http.options(this.postUrl).then(({data}) => {
                this.rest_options = data
//                this.fieldItems = this.genFieldItems(data)
                this.loading = false
            }).catch(this.onServerResponseError)
            if (!this.isCreate) {
                this.$http.get(this.detailUrl).then(({data}) => {
//                    console.log(data)
                    this.values = data
                    this.$emit('model-loaded', data)
                    this.loading = false
                }).catch(this.onServerResponseError)
            }
        },
        components: {
            InfoPopover,
            DimensionsInput
        },
        methods: {

            getWidget (f) {
                return f.type == 'boolean' ? 'checkbox' : 'text'
            },
            submit () {
                let url = this.isCreate ? this.postUrl : this.detailUrl
                this.$emit('beforesubmit', this.values)
                this.submitData(url, this.values, `${this.submitName}成功`, this.isCreate).then((data) => {
                    this.$store.state.bus.$emit("model-posted", {model: this.appModel, data: data})
                    this.id = data.id
                    this.$emit("form-posted", data)
                    return data
                }).catch((e) => {
                    console.log(e)
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
            }

        },
        computed: {
            isCreate () {
                return this.id === 'create'
            },
            postUrl () {
                return this.appModel.listUrl
            },
            detailUrl () {
                return this.appModel.detailUrl(this.id)
            },
            rules () {
                let d = {}
                Object.keys(this.fieldItems).forEach((i) => {
                    let f = this.fieldItems[i]
                    let n = f.name
                    let dt = {"CheckboxInput": Boolean}
                    let rs = d[n] = []
                    if (f.required) {
                        rs.push({type: f.type, required: true, message: `不能为空`, trigger: 'change'})

                    }
                    if (f.min_length) {
                        rs.push({min: f.min_length, message: `长度最小为${f.min_length}`, trigger: 'change'})
                    }
                    if (f.max_length) {
                        rs.push({max: f.max_length, message: `长度最大为${f.max_length}`, trigger: 'change'})
                    }
                    if (f.widget === 'dimensions') {
//                        rs.push(Paper.validate_rule())
                    }

                })
                return d

            },
            submitName () {
                return this.options.submitButtonText || '保存'
            },
            fieldItems (){
                if (!this.rest_options.actions) {
                    return []
                }
                let ff = this.rest_options.actions.POST
                let vs = {}
                let fis = this.fields.map((f) => {
                    let r = {name: f}
                    Object.assign(r, ff[f])
                    Object.assign(r, this.fieldOptions[f] || {})
                    if (r.widget === undefined) {
                        r.widget = this.getWidget(r)
                    }
                    if (this.isCreate) {
                        vs[f] = r.type === 'boolean' ? true : r.type === 'string' ? '' : null
                    }
                    return r
                })
                if (this.id === 'create') {
                    this.values = vs
                }
//                console.log(fis)
                return fis
            }
        }
    }
</script>
<style scoped></style>
