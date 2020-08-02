/**
 * Created by denishuang on 2019/8/25.
 */

import arrayNormalize from '../../utils/array_normalize'

export function joinErrors (errors) {
    let es = {}
    for (let n in errors) {
        es[n] = errors[n].join('')
    }
    return es
}
export function defaultWidget (f) {
    return f.type === 'boolean' ? 'checkbox' : (['date', 'datetime', 'time'].includes(f.type) ? f.type : ( ['integer', 'decimal'].includes(f.type) ? 'number' : 'text'))
}

export function defaultRuleType (f){
    if (f.multiple) {
        return 'array'
    }
    if (f.choices && f.choices.length > 0) {
        return typeof f.choices[0][0]
    }
    return f.model ? 'number' : (['field', 'time', 'datetime'].includes(f.type) ? 'string' : (['integer', 'decimal'].includes(f.type) ? 'number' : f.type))
}

export function defaultSpan (f){
    return f.widget === 'textarea' ? {xs: 24, sm: 24, md: 24, lg: 24, xl: 24} : {
        xs: 24,
        sm: 24,
        md: 12,
        lg: 12,
        xl: 8
    }
}
export function defaultRules (f){
    let rs = []
    if (f.required) {
        rs.push({
            type: defaultRuleType(f),
            required: true,
            message: `不能为空`
        })
    }
    if (f.min_length) {
        rs.push({min: f.min_length, message: `长度最小为${f.min_length}`})
    }
    if (f.max_length) {
        rs.push({max: f.max_length, message: `长度最大为${f.max_length}`})
    }
    return rs
}
export function normalizeItem (i) {
    let a = Object.assign({}, i)
    a.label = a.label || a.name
    a.rules = a.rules || defaultRules(a)
    a.widget = a.widget || defaultWidget(a)
    let sp = a.span
    a.span = sp && (typeof  sp === 'number' && {xs: sp, sm: sp, md: sp, lg: sp, xl: sp} || sp) || {}
    a.span = Object.assign({}, defaultSpan(a), a.span)
    return a
}
export function normalizeItems (items) {
    return arrayNormalize(items,{}, normalizeItem)
}
export function getItemRules (items) {
    let d = {}
    Object.keys(items).forEach((i) => {
        let f = items[i]
        let n = f.name
        let rs = d[n] = f.rules || []
        rs.concat(defaultRules(f))

    })
    return d

}
export default  {
    defaultRules,
    defaultRuleType,
    defaultSpan,
    defaultWidget,
    normalizeItem,
    normalizeItems,
    getItemRules,
    joinErrors
}
