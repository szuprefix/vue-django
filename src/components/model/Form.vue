<template>
    <div>
        <el-row type="flex" justify="space-between" style="padding-bottom: 20px;" v-if="!options.inline">
            <el-col :span="18">
                <slot name="actions"></slot>
            </el-col>
            <el-col :span="6" class="flex-right">
                <actions :items="_topActions"></actions>
            </el-col>
        </el-row>
        <x-form :url="url" :items="formItems" v-model="formValue" ref="form" :options="options.form" :successInfo="successInfo"
                :method="method" @form-posted="onPosted" :submit="submit">
            <span slot="submit" v-if="!options.inline"></span>
        </x-form>
        <slot name="bottom" :model="model"></slot>
    </div>
</template>
<script>
    import {Register} from '../../utils/app_model'
    import XForm from '../form/Form.vue'
    import Model from './Model'
    import server_response from '../../mixins/server_response'
    import array_normalize from '../../utils/array_normalize'
    import Actions from '../layout/Actions.vue'
    import RelatedSelect from './Select.vue'
    export default{
        mixins: [server_response],
        components: {XForm, Actions},
        props: {
            appModel: String,
            items: Array,
            value: Object,
            defaults: {
                type: Object, default: () => {
                    return {}
                }
            },
            options: {
                type: Object,
                default: () => {
                    return {}
                }
            },
            topActions: {
                type: Array, default: function () {
                    return ['delete', 'save', 'saveAndAnother']
                }
            },
        },
        data () {
            return {
                mid : undefined,
                formItems: [],
                formValue: {},
                intent: '',
                successInfo: undefined,
                model: Model(this.appModel, this.defaults, this.$store.state.bus),
                avairableActions: {
                    'save': {
                        icon: 'floppy-o',
                        title: '保存',
                        label: '',
                        do: this.onSubmit,
                        type: 'primary'
                    },
                    'refresh': {
                        icon: 'refresh',
                        title: '刷新',
                        label: '',
                        do: this.load,
                        type: 'default'
                    },
                    'delete': {
                        icon: 'trash',
                        title: '删除',
                        label: '',
                        do: this.toDelete,
                        type: 'danger',
                        show: () => this.mid && this.checkPermission('delete')
                    },
                    'saveAndAnother': {
                        icon: 'floppy-o',
                        label: '+',
                        title: '保存并新增另一个',
                        do: this.saveAndAnother
                    }
                }
            }
        },

        created(){
            this.init()
            this.$on("model-delete", this.onDelete)
        },
        methods: {
            init(){
                this.mid = this.model.id = this.getId()
//                this.formValue = this.value
                this.model.load().then((data, options) => {
                    this.mid = this.model.id
                    this.formValue = Object.assign({},this.model.data)
                    this.normalizeItems()
                    this.$emit('loaded', this.model)
                }).catch(this.onServerResponseError)
            },
            getId(){
                let id = this.value && this.value.id ||
                    this.$route.path.includes(this.model.getListUrl()) && this.$route.params.id
                    || undefined
                return id === 'create' ? undefined : id
            },
            defaultWidget (f) {
                if (f.type == 'field' && f.model) {
                    return RelatedSelect
                } else if (['field', 'choice'].includes(f.type) && f.choices) {
                    return f.choices.length <= 2 ? (f.multiple ? 'checkbox' : 'radio') : 'select'
                }
            },
            getItems () {
                if (this.items) {
                    return Promise.resolve(this.items)
                }
                return import(`@/views${this.model.getListUrl()}config.js`).then(m => {
                    return m.default.formItems
                }).catch(() => {}).then( items => {
                    return items || this.model.config.formItems || Object.values(this.model.options.actions.POST).filter(a => a.read_only !== true)
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
                    this.formItems = array_normalize(items, this.model.fieldConfigs, this.normalizeItem).filter(a => !qns.includes(a.name))
                })

            },
            submit()
            {
                return this.model.save(this.formValue)
            },
            onPosted(data)
            {
                let payLoad = {model: this.model.config, data, intent: this.intent}
                this.$emit("form-posted", payLoad)
            },
            toDelete(){
                this.$emit("model-delete", this)
            },
            clear () {
                this.model.clear()
                this.mid = this.model.id = undefined
                this.formValue = Object.assign({},this.model.data)
                this.$nextTick(this.$refs.form.$refs.form.clearValidate)
            },
            onDelete(){
                this.$confirm('确定要删除吗?', {type: 'warning'}).then(() => {
                    return this.model.destroy()
                }).catch(this.onServerResponseError)
            },
            onSubmit (context) {
                this.intent = 'save'
                this.successInfo = '保存成功.'
                return this.$refs.form.onSubmit()
            },
            saveAndAnother(){
                this.intent = 'saveAndAnother'
                this.successInfo = '保存成功, 继续添加下一个.'
                this.$refs.form.onSubmit().then((data) => {
                    if (data && data.id) {
                        this.clear()
                    }
                })
            },
            checkPermission(p){
                return this.model.checkPermission(p, this.$store.state.user.permissions)
            }
        },
        computed: {
            url () {
                return this.mid ? this.model.getDetailUrl() : this.model.getListUrl()
            },
            method () {
                return this.mid ? "put" : "post"
            },
            _topActions(){
                return array_normalize(this.topActions, this.avairableActions)
            },
        },
        watch: {
            formValue(val){
                this.model.data = val
                this.$emit("input", val)
            },
            items (val) {
                this.normalizeItems()
            },
        }
    }
</script>
