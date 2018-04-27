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
            modelFormItems: []
        }
    },
    methods: {
        modelFormInit(){
            this.modelInit()
            this.modelId = this.value && this.value.id || ( this.$route.params.id === 'create' ? undefined : this.$route.params.id)
            this.modelLoad().then((data, options) => {
                this.formMethod = this.modelId ? "put" : "post"
                this.formUrl = this.modelId ? this.modelDetailUrl : this.modelListUrl
                this.modelFormItems = this.modelFormNormalizeItems(this.formItems)
            })
        },
        modelFormDefaultWidget (f) {
            return f.type == 'field' && f.model ? RelatedSelect : ((['field', 'choice'].includes(f.type) && f.choices) ? "select" : undefined)
        },
        modelFormNormalizeItems(formItems) {
            let items = formItems.map((i) => {
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
            })
            return items
        },
        modelFormatChoices(cs){
            if (cs.length < 1 || cs[0] instanceof Array) {
                return cs
            }
            return cs.map((a) => [a.value, a.display_name])
        },
        modelFormSubmit(){
            return this.modelSave(this.formValue)
        },
        modelFormOnPosted(data){
            this.$emit("form-posted", {model: this.modelConfig, data})
        }
    },
    computed: {
        modelFormTitle(){
            return !this.modelId && `新增${this.modelConfig.verbose_name}` || this.modelData['__str__'] || this.modelData[this.modelConfig.title_field]
        }
    },
    watch: {
        modelData(val){
            this.formValue = Object.assign({}, val)

        }
    }

}