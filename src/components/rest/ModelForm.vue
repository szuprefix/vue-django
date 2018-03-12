<template>
    <div v-loading="loading" :element-loading-text="loading">
        <div v-if="fieldItems" class="flex-right">
            <el-button type="primary" @click="onSubmit"><i class="fa fa-save"></i></el-button>
        </div>
        <r-form :url="url" :fieldItems="fieldItems" :options="options" :values="values"
                :extraWidgets="extraWidgets" :method="isCreate?'post':'put'"></r-form>
    </div>
</template>
<script>
    import RForm from './Form.vue'
    import form from '../../mixins/form'
    export default{
        mixins: [
            form
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
                values: {},
            }
        },
        created () {
            this.loading = '加载中'
            this.$http.options(this.postUrl).then(({data}) => {
                this.rest_options = data
                this.loading = false
            }).catch(this.onServerResponseError)
            if (!this.isCreate) {
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
