<template>
    <div>
        <el-row type="flex" justify="space-between" style="padding-bottom: 20px;">
            <el-col :span="20">
                <slot name="actions"></slot>
            </el-col>
            <el-col :span="4" class="flex-right">
                <el-button type="primary" @click="onSubmit" :title="options.submitName || '保存'">
                    <i class="fa fa-floppy-o" aria-hidden="true"></i>
                </el-button>
            </el-col>
        </el-row>
        <r-form :url="url" :fieldItems="fieldItems" :options="options" :values="form" ref="form"
                :extraWidgets="_extraWidgets" :method="isCreate?'post':'put'" @form-posted="formPosted" :submit="submit"
                v-if="value.data">
            <span slot="submit"></span>
        </r-form>
    </div>
</template>
<script>
    import RForm from './Form.vue'
    import RelatedSelect from './RelatedSelect.vue'
    //    import form from '../../mixins/form'
    export default{
        mixins: [
//            form
        ],
        props: {
            value: {
                type: Object, default: null
            },
            fields: {
                type: Array,
                default: []
            },
            options: {
                type: Object, default(){
                    return {}
                }
            },
            extraWidgets: {
                type: Object, default(){
                    return {}
                }
            },
            fieldOptions: {
                type: Object,
                default: {}
            }
        },
        data () {
            return {
//                rest_options: {}
            }
        },
        components: {
            RForm
        },
        methods: {
            submit(){
                return this.value.save()
            },
            getWidget (f) {
                if (f.type == 'field' && f.model) {
                    return 'RelatedSelect'
                }
                if (['field', 'choice'].includes(f.type) && f.choices) {
                    return 'select'
                }
                return f.type == 'boolean' ? 'checkbox' : ( f.type == 'decimal' ? 'number' : 'text')
            },
            formPosted(data){
//                this.value.data = Object.assign({}, data)
//                this.id = this.value.id = data.id
//                this.$store.state.bus.$emit("model-posted", {model: this.value})
                this.$emit("form-posted", {model: this.value})
            },
            onSubmit(){
                this.$refs.form.onSubmit()
            },
            formatChoices(cs){
                if (cs.length < 1 || cs[0] instanceof Array) {
                    return cs
                }
                return cs.map((a) => [a.value, a.display_name])
            }

        },
        computed: {
            isCreate () {
                return !this.value.id
            },
            url (){
                return this.isCreate ? this.value.listUrl : this.value.detailUrl()
            },
            fieldItems (){
                if (!this.value.rest_options) {
                    return []
                }
//                console.log(this.value.rest_options)
                let ff = this.value.rest_options.actions.POST
                let fis = this.fields.map((f) => {
                    let r = {name: f}
                    Object.assign(r, ff[f])
                    Object.assign(r, this.fieldOptions[f] || {})
                    if (r.widget === undefined) {
                        r.widget = this.getWidget(r)
                    }

                    if (r.choices) {
                        r.choices = this.formatChoices(r.choices)
                    }
                    return r
                })
//                if (this.isCreate) {
//                    this.model.data = vs
//                }
                return fis
            },
            form(){
                return this.value.data
            },

            _extraWidgets(){
                let ws = {RelatedSelect}
                Object.assign(ws, this.extraWidgets)
                return ws
            }
        }
    }
</script>
<style scoped></style>
