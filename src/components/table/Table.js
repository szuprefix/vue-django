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

export function mergeOptions(a, b) {
    return mergeWith(a, b, customizer)
}

export function genSpanMap(data, fields, group) {
    let vs = data
    let fs = fields
    let m = {}
    let lm = {}
    let pm = {}
    vs.forEach((r, i) => {
        m[i] = {}
        let b = true
        fs.forEach((f, j) => {
            if (group > 0 && j >= group) {
                m[i][j] = 1
                return
            }
            if (b === false || r[f] !== lm[f]) {
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


export function csv2array(s, delimiter) {
    delimiter = delimiter || '\t'
    return s.split('\n').map(l => l.split(delimiter))
}

export function guessDelimit(l, allDelimits){
    allDelimits = allDelimits || [',','\t', '|']
    return allDelimits.map((a) => {
        return [l.split(a).length, a]
    }).sort().reverse()[0][1]

export function rowIsEmpty(obj) {
    return Object.values(obj).find(a => a === 0 || ![undefined, null, ''].includes(a)) === undefined
}

export function clearEmptyRow(table) {
    return table.filter(r => !rowIsEmpty(r))
}

export function autoFill(table, items, group) {
    let lr = undefined
    table.forEach(r => {
        if (lr) {
            let b = true
            items.forEach((i, j) => {
                if (group > 0 && j >= group) {
                    return
                }
                if ( b && [undefined, null, ''].includes(r[i.name])) {
                    r[i.name] = lr[i.name]
                } else {
                    b = false
                }
            })
        }
        lr = r
    })
    return table
}