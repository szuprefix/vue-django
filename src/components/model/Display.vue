<template>
    <json-display v-model="value" :field="jsonField" v-if="loaded"></json-display>
</template>
<script>
    import Model from './Model'
    import ServerResponse from '../../mixins/server_response'
    import arrayNormalize from '../../utils/array_normalize'
    import JsonDisplay from '../widgets/JsonDisplay.vue'
    import {get} from 'lodash'
    export default{
        mixins: [ServerResponse],
        components: {JsonDisplay},
        props: {
            appModel: String,
            items: Array,
            value: Object,
            field: Object
        },
        data () {
            return {
                mid: undefined,
                formItems: [],
                formValue: {},
                loaded : false,
                model: Model(this.appModel || this.field.model, this.defaults, this.$store.state.bus)
            }
        },
        created () {
            this.init()
            this.$on("model-delete", this.onDelete)
        },
        methods: {
            init(){
                this.mid = this.model.id = this.getId()
                this.model.load().then((data, options) => {
                    this.mid = this.model.id
                    this.formValue = Object.assign({}, this.model.data)
                    this.normalizeItems()
                    this.loaded = true
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
            normalizeItems() {
                this.getItems().then(items => {
                    this.formItems = arrayNormalize(items, this.model.fieldConfigs)
                })

            },
            clear () {
                this.model.clear()
                this.mid = this.model.id = undefined
                this.formValue = Object.assign({}, this.model.data, this.defaults)
                this.$nextTick(this.$refs.form.$refs.form.clearValidate)
            },
        },
        computed: {
            jsonField () {
                return {...this.field, items: this.formItems}
            }
        },
        watch: {
            value(val){
                this.formValue = val
            },
            formValue(val){
                this.model.data = val
            },
            items () {
                this.normalizeItems()
            }
        }
    }
</script>
