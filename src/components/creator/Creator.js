/**
 * Created by denishuang on 2019/12/9.
 */

import Model from '../model/Model'
import queueLimit from '../../utils/async_queue'
import {pick, uniqWith, isEqual, filter} from 'lodash'
function Creator(model, options) {
    model = typeof model === 'string' ? Model(model) : model
    let moptions = options[model.appModel] || {}
    let defaults = moptions.defaults || {}
    let extraFields = moptions.extraFields || []
    let creator = {
        model,
        foreignKeys: {},
        plainFields: {},
        defaults,
        loadUFKOptions () {
            let m = this.model
            return m.loadOptions().then(() => {
                    let ufns = m.options.unique_together
                    if (ufns) {
                        ufns[0].forEach(fn => {
                            if (fn in defaults) {
                                return
                            }
                            let f = m.fieldConfigs[fn]
                            if (!f) {
                                return
                            }
                            if (f.model) {
                                this.foreignKeys[fn] = {...f, creator: Creator(f.model, options)}
                            } else {
                                this.plainFields[fn] = {...f}
                            }
                        })
                    }
                    extraFields.forEach(fn => {
                        this.plainFields[fn] = m.fieldConfigs[fn]
                    })
                }
            ).then(() => {
                return queueLimit(Object.values(this.foreignKeys), 3, (fk) => {
                    return fk.creator.loadUFKOptions()
                })
            })
        },
        getItems () {
            let rs = []
            Object.keys(this.foreignKeys).forEach((fkn) => {
                let fk = this.foreignKeys[fkn]
                let fcreator = fk.creator
                let mlabel = fcreator.model.config.verbose_name
                fk.items = fcreator.getItems().map(a => {
                    let name = `${fkn}.${a.name}`
                    let originName = a.name
                    let label = name.split('.').length === 2 ? `${mlabel}${a.label}` : a.label
                    let d = {...a, name, originName, label}
                    return d
                })
                rs = rs.concat(fk.items)
            })
            Object.values(this.plainFields).forEach((pf) => {
                rs.push(pf)
            })
            // if (rs.length <= 1) {
            //     rs = [{name:'name', label: this.model.verbose_name}]
            // }
            return rs

        },
        claim (df) {
            let rs = {}
            Object.keys(this.foreignKeys).forEach((fkn) => {
                let fk = this.foreignKeys[fkn]
                let fcreator = fk.creator
                let pfs = fk.items.map(a => a.name)
                let sdf = uniqWith(df.map(r => pick(r, pfs)), isEqual)
                sdf = sdf.map(r => {
                    let d = {}
                    fk.items.forEach(a => {
                        d[a.originName] = r[a.name]
                    })
                    return d
                })
                Object.assign(rs, fcreator.claim(sdf))
            })
            rs[this.model.appModel] = df
            return rs
        },
        create (claimedData) {
            let cds = claimedData[this.model.appModel]
            return queueLimit(Object.keys(this.foreignKeys), 1, (fkn) => {
                let fk = this.foreignKeys[fkn]
                let fcreator = fk.creator
                return fcreator.create(claimedData).then((fmap) => {
                    fmap.forEach((id, d) => {
                        let nd = {}
                        fk.items.forEach(a => {
                            nd[a.name] = d[a.originName]
                        })
                        filter(cds, nd).forEach(r => {
                            r[fk.name] = id
                        })
                    })
                })

            }).then(() => {
                let map = new Map()
                return queueLimit(cds, 3, r => {
                    let rd = Object.assign({}, defaults)
                    Object.keys(r).forEach(fn => {
                        if(!fn.includes('.')){
                            rd[fn] = r[fn]
                        }
                    })
                    return this.model.selectOrCreate(rd).then(d => {
                        map.set(r, d.id)
                    })
                }).then(() => map)
            })


        },
        run (df) {
            return this.create(this.claim(df))
        }

    }
    return creator
}

export default Creator