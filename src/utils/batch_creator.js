/**
 * Created by denishuang on 2019/6/5.
 */

import {Register} from './app_model'

import queueLimit from './async_queue'
import {countBy, groupBy, merge, last} from 'lodash'

function Registry() {
    this.dmap = {}
    this.key = function (d){
        return typeof d === 'object' ? JSON.stringify(d) : d
    }
    this.get = function(d) {
        return this.dmap[this.key(d)]
    }
    this.set = function(d, v) {
        this.dmap[this.key(d)] = v
    }
}

export default {
    batchLoadOptions(models){
        return queueLimit(models, 3, (model) => {
            return Register.get(model).loadOptions()
        })
    },
    getModels(d){
        let rs = []
        d.fields.forEach((f) => {
            if (f.model) {
                rs = rs.concat(this.getModels(f))
            }
        })
        if (d.model) {
            rs.push(d.model)
        }
        return rs
    },
    getStructure(d){
        let st = merge({}, d)

        function _getStructure(s) {
            let c = 0
            if (s.foreignKeys) {
                s.foreignKeys.forEach(fk => {
                    let fs = _getStructure(fk)
                    c += fs.count
                })
            }
            c += s.plainFields.length
            s.count = c
            if(!s.rel){
                s.rel=last(s.name.split('.'))
            }
            s.registry = {}
            return s
        }

        return _getStructure(st)
    },
    genStructData(series, structure){
        let st = structure
        let c = st.count
        let pfs = st.plainFields
        let pfsc = pfs.length
        let r = {}
        let pfds = series.slice(c-pfsc)
        pfs.forEach((f,i) => {
            r[f] = pfds[i]
        })

        if(st.foreignKeys){
            let p = 0
            st.foreignKeys.forEach(fk => {
               let fkds = series.slice(p, p+fk.count)
                r[fk.rel]=genStructData(fkds, fk)
                p+=fk.count
            })
        }

        return r
    },
    genStructDataList(dataframe, structure){
        return dataframe.map(s =>  genStructData(s, structure))
    },
    genRegister(structure){

    },
    getFieldsByStep(d, ls, rel, p) {
        if (!ls) {
            ls = []
        }
        let model = Register.get(d.model)
        let fms = model.config.rest_options.actions.POST
        // d.name = d.name || d.model.split('.')[1]
        // p = p || ''
        let prefix = d.name ? `${p}${d.name}.` : ''
        d.fields.forEach((f) => {
            if (typeof f === 'string') {
                let fd = fms[f]
                ls.push({...fd, name: `${prefix}${f}`, owner: model, rel, rel_name: d.name})
            } else if (f.model) {
                this.getFieldsByStep(f, ls, model, prefix)
            } else {
                let fd = fms[f.name]
                ls.push({...fd, name: `${prefix}${f.name}`, owner: model, rel, rel_name: d.name})
            }
        })
        return ls
    },
    getFields(d){
        let ls = this.getFieldsByStep(d)
        let lcs = countBy(ls, a => a.label)
        ls.forEach(a => {
            if (lcs[a.label] > 1) {
                a.label = a.owner.verboseName + a.label
            }
        })
        return ls
    },
    groupByModel(fs){
        return groupBy(fs, f => f.owner.fullName)
    },
    create(fs, model){
        let fns1 = fs.filter(f => f.owner.fullName === model).map(f => f.name)
        let fns2 = fs.filter(f => f.rel.fullName === model).map(f => f.rel_name)
    },
    trimKeys(d){
        let r = {}
        Object.keys(d).forEach((k) => {
            let nk = last(k.split('.'))
            r[nk] = d[k]
        })
        return r
    }
}