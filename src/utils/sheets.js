/**
 * Created by denishuang on 2019/7/4.
 */

import {set, unset, uniqueId, pick, range} from 'lodash'
export default {
    mergeColumn(block,mfns){
        let fs = block.fields
        let bf = fs.find(a => a.name === mfns[0])
        let mfs = fs.filter(a => mfns.slice(1).includes(a.name))

        let ds = block.data
        let ds2 = []
        let nfn = `mergeField${uniqueId()}`
        let nf = Object.assign({}, bf, {name: nfn, label: nfn})
        let cfs = fs.filter(f => !mfns.includes(f.name))
        let cfns = cfs.map(f => f.name)
        ds.forEach(d => {
            d[nfn] = bf.label
            let bvs = pick(d, cfns)
            mfs.forEach(f => {
                let nd = Object.assign({}, bvs)
                nd[nfn] = f.label
                nd[bf.name] = d[f.name]
                ds2.push(nd)
            })
        })
        block.data = ds.concat(ds2)
        block.fields = cfs.concat([bf, nf])
    },
    mergeBlock(blocks, extras){
        if (blocks.length === 0) {
            return blocks
        }
        let ds = []
        let bb = blocks[0]
        let fs = bb.fields
        blocks.forEach((b, i) => {
            if(i>0){
                let pairs = b.fields.map((f,j) => [f.name, fs[j].name])
                this.renameColumn(b, pairs)
                console.log(pairs)
            }
            b.data.forEach((d, j) => {
                ds.push(Object.assign({block: b.name }, extras, d))
            })
        })
        if (!fs.find(a => a.name === 'block')) {
            fs.push({name: 'block', type: 'string'})
        }
        if (extras) {
            Object.keys(extras).forEach(k => {
                if (!fs.find(a => a.name === k)) {
                    fs.push({name: k, type: typeof extras[k]})
                }
            })
        }
        return [{count: ds.length, data: ds, fields: fs, name: bb.name}]
    },
    mergeSheet(sheets){
        let data = []
        let sheet = sheets.find(s => s.blocks && s.blocks.length > 0)

        let fields = sheet.blocks[0].fields
        sheets.forEach((s, i) => {
            let block = this.mergeBlock(s.blocks, {sheet: s.name || `sheet${1 + i}`})[0]
            if (block) {
                data = data.concat(block.data)
            }
        })
        return [{blocks: [{count: data.length, data, fields}], name: sheet.name}]
    },
    normalize(sheets){
        sheets.forEach((s, i) => {
            if (!s.name) {
                s.name = `Sheet${1 + i}`
            }
            s.blocks.forEach((b, j) => {
                if (!b.name) {
                    b.name = `Block${1 + j}`
                }
                b.fields.forEach((f, k) => {
                    if (!f.label) {
                        f.label = f.name
                    }
                })
            })
        })
    },
    renameColumn(block, pairs){
        pairs = pairs.filter(p => p[0] !== p[1])
        if(pairs.length === 0){
            return
        }
        block.data.forEach(d => {
            pairs.forEach(p => {
                d[p[1]] = d[p[0]]
                delete d[p[0]]
            })
        })
        pairs.forEach(p => {
            let f = block.fields.find(f => f.name === p[0])
            f.label = f.name = p[1]
        })
    },
    splitLine2Column(block, spfns){
        let re = /\s+/g
        let ds = block.data
        let fs = block.fields
        let spfs = fs.filter(f => spfns.includes(f.name))
        let nfcs = {}
        ds.forEach(d => {
            spfs.forEach(f => {
                let v = d[f.name]
                if (!v) return
                let ps = d[f.name].trim().split(re)
                nfcs[f.name] = Math.max(nfcs[f.name] || 0, ps.length)
                ps.forEach((p, i) => {
                    d[`${f.name}${i + 1}`] = p
                })
            })
        })
        let nfs = []
        fs.forEach(f => {
            if (f.name in nfcs) {
                range(nfcs[f.name]).forEach(i => {
                    nfs.push({name: `${f.name}${i + 1}`, label: `${f.name}${i + 1}`, type: 'string'})
                })
            }
        })
        block.fields = fs.concat(nfs)
    },
    splitLine2Row(block, spfns){
        let re = /\s+/g
        let ds = block.data
        let fs = block.fields
        let spfs = fs.filter(f => spfns.includes(f.name))
        let nds = []
        let cfs = fs.filter(f => !spfns.includes(f.name))
        let cfns = cfs.map(f => f.name)
        ds.forEach(d => {
            let cps = pick(d, cfns)
            spfs.forEach(f => {
                let v = d[f.name]
                if (!v) return
                let ps = d[f.name].trim().split(re)
                ps.forEach(p => {
                    let d = {}
                    d[f.name] = p
                    d = Object.assign(d,cps)
                    nds.push(d)
                })

            })
        })
        block.data = nds
    }
}