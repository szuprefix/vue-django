<template>
    <div>
        <el-row type="flex" justify="space-between" style="padding-bottom: 20px;" v-if="!options.inline">
            <el-col :span="18">
                <slot name="actions"></slot>
            </el-col>
            <el-col :span="6" class="flex-right">
                <actions :items="topActionItems" :context="{model: model, view: this}" style="margin-right: 1rem"></actions>
            </el-col>
        </el-row>
        <x-form :url="url" :items="formItems" v-model="formValue" ref="form" :options="options.form" :disabled="disabled"
                :successInfo="successInfo" :method="method" @form-posted="onPosted" :submit="submit">
            <span slot="submit" v-if="!options.inline"></span>
        </x-form>
        <slot name="bottom" :model="model"></slot>
    </div>
</template>
<script>
    import XForm from '../form/Form.vue'
    import Model from './Model'
    import ServerResponse from '../../mixins/server_response'
    import arrayNormalize from '../../utils/array_normalize'
    import Actions from '../layout/Actions.vue'
    import RelatedSelect from './Select.vue'
    import {get} from 'lodash'
    export default{
        mixins: [ServerResponse],
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
            topActions: Array
        },
        data () {
            return {
                mid: undefined,
                formItems: [],
                formValue: {},
                intent: '',
                successInfo: undefined,
                model: Model(this.appModel, this.defaults, this.$store.state.bus),
                avairableActions: {
                    'save': {
                        icon: 'save',
                        title: '保存',
                        label: '',
                        do: this.onSubmit,
                        show: () => this.checkPermission('create') || this.checkPermission('update'),
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
                        show: () => this.mid && this.checkPermission('destroy')
                    },
                    'saveAndAnother': {
                        icon: 'save',
                        label: '+',
                        title: '保存并新增另一个',
                        do: this.saveAndAnother,
                        show: () => this.checkPermission('create') || this.checkPermission('update')
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
                this.model.load().then(rs => {
                    this.mid = this.model.id
                    this.formValue = {...this.value, ...rs[0]}
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
                if (f.type == 'field' && f.model) {
                    return RelatedSelect
                } else if (['field', 'choice'].includes(f.type) && f.choices) {
                    return f.choices.length <= 2 ? (f.multiple ? 'switch' : 'radio') : 'select'
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
            submit()
            {
                return this.model.save(this.formValue)
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
            checkPermission(p, m){
                m = m || this
                let ps = this.$store.state.user.model_permissions[m.appModel]
                return ps && ps.includes(p)
            },
            normalizeActions(actions){
                return arrayNormalize(actions, this.avairableActions, (a) => {
                    if (a instanceof Array) {
                        return this.normalizeActions(a)
                    } else {
                        if(!a.do) {
                            a.do=`${this.appModel.replace('.', '/')}/${a.name}`
                        }
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
