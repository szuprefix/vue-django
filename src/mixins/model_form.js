/**
 * Created by denishuang on 2018/4/24.
 */
import model_view from './model_view'
import form_view from './form_view'
import RelatedSelect from '../components/rest/RelatedSelect2.vue'
export default {
    mixins: [model_view, form_view],
    data(){
        return {
            modelFormItems: [],
            modelFormAvairableActions: {
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
                }
            },
        }
    },
    methods: {
        modelFormInit(){
            this.modelInit()
            let id = this.value && this.value.id || this.$route.params.id
            // console.log(this.value)
            this.modelId = id === 'create' ? undefined : id
            this.modelLoad().then((data, options) => {
                this.formMethod = this.modelId ? "put" : "post"
                this.formUrl = this.modelId ? this.modelDetailUrl : this.modelListUrl
                this.modelFormItems = this.formNormalizeItems(this.modelFormNormalizeItems(this.formItems))
            })
        },
        modelFormDefaultWidget (f) {
            return f.type == 'field' && f.model ? RelatedSelect : ((['field', 'choice'].includes(f.type) && f.choices) ? "select" : undefined)
        },
        modelFormNormalizeItem(i)
        {
            let a
            if (typeof i == 'string') {
                a = this.modelFieldConfigs[i]
            } else {
                a = Object.assign({}, this.modelFieldConfigs[i.name], i)
            }
            a.widget = a.widget || this.modelFormDefaultWidget(a)
            if (a.choices) {
                a.choices = this.modelFormatChoices(a.choices)
            }
            return a
        },
        modelFormNormalizeItems(formItems) {
            let items = formItems.map((i) => this.modelFormNormalizeItem(i))
            return items
        },
        modelFormatChoices(cs)
        {
            if (cs.length < 1 || cs[0] instanceof Array) {
                return cs
            }
            return cs.map((a) => [a.value, a.display_name])
        },
        modelFormSubmit()
        {
            return this.modelSave(this.formValue)
        },
        modelFormOnPosted(data)
        {
            let payLoad = {model: this.modelConfig, data}
            this.$emit("form-posted", payLoad)
        }
    },
    computed: {
        modelFormTitle()
        {
            return !this.modelId && `新增${this.modelConfig.verbose_name}` || this.modelData['__str__'] || this.modelData[this.modelConfig.title_field]
        }
    },
    watch: {
        modelData(val)
        {
            this.formValue = Object.assign({}, val)

        }
    }

}