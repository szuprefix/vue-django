/**
 * Created by denishuang on 2018/4/24.
 */
import model_view from './model_view'
import form_view from './form_view'
import RelatedSelect from '../components/rest/RelatedSelect2.vue'
export default {
    mixins: [model_view, form_view],

    methods: {
        modelEmptyDataFromOptions(m){
            let r = {}
            Object.keys(m).forEach((k) => {
                let f = m[k]
                r[k] = f.type === 'boolean' ? true : f.multiple ? [] : f.type === 'string' ? '' : null
            })
            return r
        },
        modelFormDefaultWidget (f) {
            return f.type == 'field' && f.model ? RelatedSelect : ((['field', 'choice'].includes(f.type) && f.choices) ? "select" : undefined)
        },
        modelFormItems(formItems) {
            return formItems.map((i) => {
                let a
                if (typeof i == 'string') {
                    a = Object.assign({}, this.modelFieldConfigs[i])
                    a.name = i
                } else {
                    a = Object.assign({}, this.modelFieldConfigs[i.name], i)
                }
                a.widget = a.widget || this.modelFormDefaultWidget(a)
                if (a.choices) {
                    a.choices = this.modelFormatChoices(a.choices)
                }
                return a
            })
        },
        modelFormatChoices(cs){
            if (cs.length < 1 || cs[0] instanceof Array) {
                return cs
            }
            return cs.map((a) => [a.value, a.display_name])
        }
    }

}