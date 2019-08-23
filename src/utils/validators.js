/**
 * Created by denishuang on 2019/7/31.
 */

import {strQ2B} from './quanbanjiao'

import schema from 'async-validator'

export function notFloat(v) {
    if (typeof v === 'number') {
        return Number.parseInt(v)
    }
    return v
}


export function banjiao(v) {
    return strQ2B(v)
}

export function noSpace(v) {
    return v.replace(/\s/g, '')
}

export function unicode(v) {
    if(v === null || v === undefined && ''){
        return ''
    }
    return '' + v
}

export const NUM_STR_FORMATERS = [notFloat, unicode, banjiao, noSpace]

export const HanName = {
    synonyms: ['名字','姓名'],
    type: 'string',
    pattern: '^[·\u4e00-\u9fa5]{2,}$',
    message: '格式不正确',
    format(v){
        return [unicode, noSpace].reduce((v, f) => f(v), v)
    }
}
export const Mobile = {
    synonyms: ['手机', '手机号', '手机号码'],
    type: 'string',
    pattern: '^1[3-9]\\d{9}$',
    message: '格式不正确',
    format(v){
        return NUM_STR_FORMATERS.reduce((v, f) => f(v), v)
    }
}

export const IDCard = {
    synonyms: ['身份证', '身份证号', '身份证号码'],
    type: 'string',
    pattern: '^[1-9]\d{5}(19|2\d)\d{2}((0[1-9])|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$',
    message: '格式不正确',
    format(v){
        return NUM_STR_FORMATERS.reduce((v, f) => f(v), v)
    }
}


export const QQ = {
    synonyms: ['QQ', 'QQ号', 'QQ号码', '扣扣'],
    type: 'string',
    pattern: '^\d{4,16}$',
    message: '格式不正确',
    format(v){
        return NUM_STR_FORMATERS.reduce((v, f) => f(v), v)
    }
}
export function Validator(config) {
    return {
        config,
        validator: new schema(config),
        validate(d){
            this.validator.validate(d, (errors, fields) => {
                if(errors){
                    let ed={}
                    errors.forEach(e => {
                        ed[e.field] = ed[e.field] || []
                        ed[e.field].push(e.message)
                    })
                    d.$errors = ed
                }
            })
        },
        format(d){
            let cs = this.config
            Object.keys(cs).forEach(k => {
                let rs = cs[k]
                if(!Array.isArray(rs)){
                    rs = [rs]
                }
                rs.forEach(r => {
                    if(r.format){
                        d[k] = r.format(d[k])
                    }
                })
            })
            return d
        }
    }
}
export function genValidatorFromTableItems(fs) {
    let config = {}
    fs.forEach(f => {
        if (f.rules) {
            config[f.name] = f.rules
        }
    })
    return Validator(config)
}


export function getFieldRuleType(f) {
    if (f.multiple) {
        return 'array'
    } else if (f.choices && f.choices.length > 0) {
        return typeof f.choices[0][0]
    } else if (f.model || ['integer', 'decimal'].includes(f.type)) {
        return 'number'
    } else if (['field', 'time'].includes(f.type)) {
        return 'string'
    }
    return f.type
}

export function clear$Fields(d){
    let r = {}
    Object.keys(d).forEach(k => {
        if(!k.startsWith('$')){
            r[k] = d[k]
        }
    })
    return r
}
export function genFieldRules(f) {
    let rs = []
    if (f.required) {
        rs.push({
            type: getFieldRuleType(f),
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