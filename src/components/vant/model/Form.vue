<template>
    <x-form :url="url" :items="formItems" ref="form" :disabled="disabled" @failed="onFailed"
            :procedure="submit" v-bind="[$attrs, $props]" v-on="$listeners" v-model="formValue">
    </x-form>
</template>
<script>
    import XForm from '../form/Form.vue'
    import Model from '../../model/Model'
    import ServerResponse from '../../../mixins/server_response'
    import arrayNormalize from '../../../utils/array_normalize'
    import ModelPicker from './widgets/Picker.vue'
    import {get} from 'lodash'
    import {Toast}  from 'vant'
    export default{
        mixins: [ServerResponse],
        components: {XForm, ModelPicker},
        props: {
            appModel: String,
            items: Array,
            value: Object,
            defaults: {
                type: Object, default: () => {
                    return {}
                }
            }
        },
        data () {
            return {
                mid: undefined,
                formItems: [],
                formValue: {},
                model: Model(this.appModel, this.defaults),
            }
        },

        created(){
            this.init()
        },
        methods: {
            init(){
                this.formValue = this.value
                this.mid = this.model.id = this.getId()
                this.model.load().then((data, options) => {
                    this.mid = this.model.id
                    this.model.fillEmptyDataFromOptions(this.formValue)
                    this.normalizeItems()
                    this.$emit('loaded', this.model)
                }).catch(this.onServerResponseError)
            },
            getId(){
                let id = this.value && this.value.id ||
                    this.$route.path.startsWith(this.model.getListUrl()) && this.$route.params.id
                    || undefined
                return id === 'create' ? undefined : id
            },
            defaultWidget (f) {
                if (f.type === 'field' && f.model) {
                    return ModelPicker
                } else if (['field', 'choice'].includes(f.type) && f.choices) {
                    return f.choices.length <= 2 ? (f.multiple ? 'checkbox' : 'radio') : 'select'
                }
            },
            getItems () {
                if (this.items) {
                    return Promise.resolve(this.items)
                }
                return import(`@/views${this.model.getListUrl()}config.js`).then(m => {
                    let c = m.default
                    return this.mid && c.update || c.create || c.form || {}
                }).catch(() => {
                    return {}
                }).then(config => {
                    return config.items || Object.values(this.model.options.actions.POST).filter(a => a.read_only !== true)
                })
            },

            normalizeItem(a)
            {
                a.widget = a.widget || this.defaultWidget(a)
                return a
            },
            normalizeItems() {
                this.getItems().then(items => {
                    let qns = Object.keys(this.defaults)
                    this.formItems = arrayNormalize(items, this.model.fieldConfigs, this.normalizeItem).filter(a => !qns.includes(a.name))
                })

            },
            submit () {
                return this.model.save(this.formValue).then(this.onSuccess)
            },
            onPosted(data)
            {
                let payLoad = {model: this.model.config, data, intent: this.intent}
                this.$emit("form-posted", payLoad)
                this.$emit('input', data)
            },
            toDelete(){
                this.$emit("model-delete", this)
            },
            clear () {
                this.model.clear()
                this.mid = this.model.id = undefined
                this.formValue = Object.assign({}, this.model.data, this.defaults)
                this.$nextTick(this.$refs.form.$refs.form.clearValidate)
            },
            onDelete(){
                this.$confirm('确定要删除吗?', {type: 'warning'}).then(() => {
                    return this.model.destroy()
                }).catch(this.onServerResponseError)
            },
            onSuccess (context) {
                Toast('保存成功.')
//                this.successInfo = '保存成功.'
            },
            onFailed (errorInfo) {
                console.log(errorInfo)
            },
            checkPermission(p, m){
                m = m || this
                let ps = get(this.$store.state, 'user.model_permissions[m.appModel]')
                return ps && ps.includes(p)
            },
            normalizeActions(actions){
                return arrayNormalize(actions, this.avairableActions, (a) => {
                    if (a instanceof Array) {
                        return this.normalizeActions(a)
                    } else {
                        return a
                    }
                })
            }
        },
        computed: {
            url () {
                return this.mid ? this.model.getDetailUrl() : this.model.getListUrl()
            },
            method () {
                return this.mid ? "put" : "post"
            },
            topActionItems () {
                let tas = this.topActions || get(this.model.viewsConfig, 'form.topActions') || ['save', 'saveAndAnother', ['delete']]
                return this.normalizeActions(tas)
            },
            disabled () {
                return !(this.checkPermission('update', this.model) || this.checkPermission('create', this.model))
            }
        },
        watch: {
            value(val){
                this.formValue = val
            },
            formValue(val){
                this.model.data = val
                this.$emit("input", val)
            },
            items () {
                this.normalizeItems()
            },
            defaults () {
                this.normalizeItems()
            }
        }
    }
</script>
