/**
 * Created by denishuang on 2019/6/5.
 */

import {Register} from './app_model'
import Qs from 'qs'
import axios from '../configs/axios'
import queueLimit from './async_queue'
import {countBy, groupBy, merge, last, uniqueId} from 'lodash'

function ModelAccount(appModelName) {
    // let model={}
    let model = Register.get(appModelName)
    model.loadOptions()
    return {
        dmap: {},
        count: 0,
        rel: undefined,
        foreignKeys: [],
        plainFields: [],
        model,
        key (d){
            return typeof d === 'object' ? JSON.stringify(d) : d
        },
        get (d) {
            return this.dmap[this.key(d)]
        },
        getRemote(d){
            return axios.get(`${this.model.listUrl}?${Qs.stringify(d)}`).then(({data}) => {
                if (data.count === 1) {
                    return Promise.resolve(data.results[0])
                } else {
                    return Promise.reject(`数据异常:${data.count}`)
                }
            })
        },
        async getPk(d){
            let pk = this.get(d)
            if(pk){
                return pk
            }
            let rels = {}
            for (var i in this.foreignKeys) {
                let a = this.foreignKeys[i]
                rels[a.rel] = await a.getPk(d[a.rel])
            }
            console.log(rels)
            if (Object.values(rels).find(a => a < 0)) {
                pk = -uniqueId()
                this.set(d, pk)
                return pk
            }
            let q = Object.assign({}, d, rels)
            let o = await this.getRemote(q).catch(err => {
            })
            pk = o && o.id || -uniqueId()
            this.set(d, pk)
            return pk
        },
        set  (d, v) {
            this.dmap[this.key(d)] = v
        },
        genData (series) {
            let c = this.count
            let pfs = this.plainFields
            let pfsc = pfs.length
            let r = {}
            let pfds = series.slice(c - pfsc)
            pfs.forEach((f, i) => {
                r[f] = pfds[i]
            })

            if (this.foreignKeys) {
                let p = 0
                this.foreignKeys.forEach(fk => {
                    let fkds = series.slice(p, p + fk.count)
                    r[fk.rel] = fk.genData(fkds)
                    p += fk.count
                })
            }

            return r
        },
        genDataList(dataframe){
            return dataframe.map(s => this.genData(s))
        },
        getNotExists(){
            return Object.keys(this.dmap).filter(a => this.dmap[a]<0).map(a => JSON.parse(a))
        },
        getTableItems() {
            let tis = []
            let fmap = model.config.rest_options.actions.POST
            this.foreignKeys.forEach(a => {
                let i = fmap[a.rel]
                i.subColumns = a.getTableItems()
                i.name=`${model.name}.${a.rel}`
                tis.push(i)
            } )
            this.plainFields.forEach(a => {
                let i = fmap[a]
                i.name=`${model.name}.${a}`
                tis.push(i)
            })
            return tis

        },
        getCsvItems() {

        },
        getModelNames(){
            let mns = []
            this.foreignKeys.forEach(a => mns=mns.concat(a.getModelNames()))
            mns.push(appModelName)
            return mns
        }
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
    getStructure(s){
        let r = ModelAccount(s.name)
        r.plainFields = s.plainFields
        r.rel = s.rel
        if (s.foreignKeys) {
            s.foreignKeys.forEach(fk => {
                let st = this.getStructure(fk)
                r.count += st.count
                r.foreignKeys.push(st)
            })
        }
        r.count += s.plainFields.length
        if (!r.rel) {
            r.rel = last(s.name.split('.'))
        }
        return r
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