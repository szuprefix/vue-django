/**
 * Created by denishuang on 2019/8/25.
 */
import {mergeWith, isArray} from 'lodash'
export const DEFAULT_PAGE_SIZE = 20

function customizer(objValue, srcValue) {
    if (isArray(objValue)) {
        return srcValue
    }
}

export function mergeOptions (a, b) {
    return mergeWith(a, b, customizer)
}
export function genSpanMap (data, fields) {
    let vs = data
    let fs = fields
    let m = {}
    let lm = {}
    let pm = {}
    vs.forEach((r, i) => {
        m[i] = {}
        let b = true
        fs.forEach((f, j) => {
            if (b == false) {
                lm[f] = undefined
            }
            if (r[f] !== lm[f]) {
                let c = pm[f] || 0
                m[i - c][j] = c
                pm[f] = 0
                b = false
            }
            pm[f] = pm[f] + 1
            m[i][j] = 0
            lm[f] = r[f]
        })
    })
    fs.forEach((f, j) => {
        let c = pm[f] || 1
        m[vs.length - c][j] = c
    })
//                console.log(m)
    return m
}

export function flatten(ns, children_field_name) {
    let r = []
    ns.forEach(a => {
        let sns = a[children_field_name]
        if (sns) {
            r = r.concat(flatten(sns, children_field_name))
        } else {
            let n = Object.assign({}, a)
            // delete n[children_field_name]
            r.push(n)
        }
    })
    return r
}