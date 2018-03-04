<template>
    <div>
        <div v-if="fieldItems" class="flex-right">
            <el-button type="primary" @click="onSubmit"><i class="fa fa-save"></i></el-button>
        </div>
        <r-form :url="url" :fieldItems="fieldItems" :options="options" :values="values"
                :extraWidgets="extraWidgets" :method="isCreate?'post':'put'"></r-form>
    </div>
</template>
<script>
    import server_response from '../../mixins/server_response'
    import RForm from './Form.vue'
    export default{
        mixins: [
            RForm
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
//                console.log('detail url:' + this.detailUrl)
                this.$http.get(this.detailUrl).then(({data}) => {
                    this.values = data
                    this.$emit('model-loaded', data)
                    this.loading = false
                }).catch(this.onServerResponseError)
            }
        },
        components: {
            RForm
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
                return this.appModel.listUrl()
            },
            detailUrl () {
                return this.appModel.detailUrl(this.id)
            },
            url (){
                return this.isCreate ? this.postUrl : this.detailUrl
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
