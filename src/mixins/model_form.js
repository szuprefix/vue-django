/**
 * Created by denishuang on 2018/4/24.
 */
import model_view from './model_view'
import form_view from './form_view'
import RelatedSelect from '../components/rest/RelatedSelect.vue'
export default {
    mixins: [model_view, form_view],
    data(){
        return {
            modelFormItems: [],
            modelFormAvairableActions: {
                'back': {
                    icon: 'angle-left',
                    title: '后退',
                    label: '',
                    do: this.onBack,
                    type: 'default'
                },
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
                    do: this.modelLoad,
                    type: 'default'
                },
                'delete': {
                    icon: 'trash',
                    title: '删除',
                    label: '',
                    do: this.modelFormToDelete,
                    type: 'danger',
                    show: () => this.modelCheckPermission('delete')
                },
                'saveadd': {
                    label: '保存并新增另一个',
                    do: this.modelSaveAndAdd
                }
            },
        }
    },

    methods: {
        modelFormGetId(){
            let id = this.value && this.value.id || this.id || this.$route.params.id
            return id === 'create' ? undefined : id
        },
        modelFormInit(){
            this.modelInit()
            this.modelId = this.modelFormGetId()
            this.modelLoad().then((data, options) => {
                this.modelFormItems = this.formNormalizeItems(this.modelFormNormalizeItems(this.formItems))
            })
        },
        modelFormDefaultWidget (f) {
            if (f.type == 'field' && f.model) {
                return RelatedSelect
            } else if (['field', 'choice'].includes(f.type) && f.choices) {
                return f.choices.length <= 2 ? (f.multiple ? 'checkbox' : 'radio') : 'select'
            }
        },
        modelFormNormalizeItem(i)
        {
            let a
            if (typeof i == 'string') {
                a = Object.assign({},this.modelFieldConfigs[i])
                if (!a) {
                    console.error(i, " not found in ", this.modelFieldConfigs)
                }
            } else {
                a = Object.assign({}, this.modelFieldConfigs[i.name], i)
            }
            a.widget = a.widget || this.modelFormDefaultWidget(a)
            return a
        },
        modelFormNormalizeItems(formItems) {
            let items = formItems.map((i) => this.modelFormNormalizeItem(i))
            return items
        },
        modelFormSubmit()
        {
            return this.modelSave(this.formValue)
        },
        modelFormOnPosted(data)
        {
            let payLoad = {model: this.modelConfig, data}
            this.$emit("form-posted", payLoad)
        },
        modelFormToDelete(){
            this.$emit("model-delete", this)
        },
        modelSaveAndAdd(){
            this.modelSave().then(() => {
                this.$route.replace(`${this.modelListUrl}create/`)
            }).catch(this.onServerResponseError)
        }
    },
    computed: {
        modelFormTitle()
        {
            return !this.modelId && `新增${this.modelConfig.verbose_name}` || this.modelData['__str__'] || this.modelData[this.modelConfig.title_field] || `编辑${this.modelConfig.verbose_name}`
        }
    },
    watch: {
        modelData(val)
        {
            this.formValue = Object.assign({}, val)
            this.$emit("change", val)
        },
        formMethod () {
            return this.modelId ? "put" : "post"
        },

        formUrl () {
            return this.modelId ? this.modelDetailUrl : this.modelListUrl
        }
    }

}
