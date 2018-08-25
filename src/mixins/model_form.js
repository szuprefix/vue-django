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
                    type: 'danger'
                },
                'saveadd': {
                    label: '保存并新增另一个',
                    do: this.modelSaveAndAdd
                }
            },
        }
    },

    computed: {
      formMethod () {
        return this.modelId ? "put" : "post"
      },

      formUrl () {
        return this.modelId ? this.modelDetailUrl : this.modelListUrl
      }
    },

    methods: {
        modelFormInit(){
            this.modelInit()
            let id = this.value && this.value.id || this.$route.params.id
            // console.log(this.value)
            this.modelId = id === 'create' ? undefined : id
            this.modelLoad().then((data, options) => {
                // this.formMethod = this.modelId ? "put" : "post"
                // this.formUrl = this.modelId ? this.modelDetailUrl : this.modelListUrl
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
                if(!a){
                    console.error(i," not found in ",this.modelFieldConfigs)
                }
            } else {
                a = Object.assign({}, this.modelFieldConfigs[i.name], i)
            }
            a.widget = a.widget || this.modelFormDefaultWidget(a)
            // if (a.choices) {
            //     a.choices = this.modelFormatChoices(a.choices)
            // }
            return a
        },
        modelFormNormalizeItems(formItems) {
            let items = formItems.map((i) => this.modelFormNormalizeItem(i))
            return items
        },
        // modelFormatChoices(cs)
        // {
        //     if (cs.length < 1 || cs[0] instanceof Array) {
        //         return cs
        //     }
        //     return cs.map((a) => [a.value, a.display_name])
        // },
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
            this.$emit("model-delete",this)
        },
        modelSaveAndAdd(){
            this.modelSave().then(()=> {
                this.$route.replace(`${this.modelListUrl}create/`)
            }).catch(this.onServerResponseError)
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
            this.$emit("change", val)
        }
    }

}
