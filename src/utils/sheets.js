/**
 * Created by denishuang on 2019/7/4.
 */

import {set, unset, uniqueId, pick, range} from 'lodash'
export const ColumnUtil = {
    merge (block, mfns){
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
    rename(block, pairs){
        pairs = pairs.filter(p => p[0] !== p[1])
        if (pairs.length === 0) {
            return
        }
        block.data.forEach(d => {
            pairs.forEach(p => {
                d[p[1]] = d[p[0]]
                delete d[p[0]]
            })
        })
        // console.log([pairs, block.fields])
        pairs.forEach(p => {
            let f = block.fields.find(f => f.name === p[0])
            f.label = f.name = p[1]
        })

    },
    drop (block, cns){
        block.fields = block.fields.filter(a => !cns.includes(a.name))
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
                    d = Object.assign(d, cps)
                    nds.push(d)
                })

            })
        })
        block.data = nds
    }
}

export const BlockUtil = {
    merge(sheet, mbns, extras){
        let bs = sheet.blocks
        let mbs = bs.filter(b => mbns.includes(b.name))
        let obs = bs.filter(b => !mbns.includes(b.name))
        if (mbs.length === 0) {
            return
        }
        let ds = []
        let bb = mbs[0]
        let fs = bb.fields
        mbs.forEach((b, i) => {
            if (i > 0) {
                let pairs = b.fields.map((f, j) => [f.name, fs[j].name])
                ColumnUtil.rename(b, pairs)
            }
            b.data.forEach((d, j) => {
                ds.push(Object.assign({block: b.name}, d))
            })
        })
        if (!fs.find(a => a.name === 'block')) {
            fs.push({name: 'block', type: 'string'})
        }
        if (extras) {
            ds.forEach((d, i) => {
                Object.assign(d, extras)
            })
            Object.keys(extras).forEach(k => {
                if (!fs.find(a => a.name === k)) {
                    fs.push({name: k, type: typeof extras[k]})
                }
            })
        }
        sheet.blocks = [{count: ds.length, data: ds, fields: fs, name: bb.name}].concat(obs)
    },
    drop(sheet, bns){
        sheet.blocks = sheet.blocks.filter(a => !bns.includes(a.name))
    }
}
export const SheetUtil = {
    merge(book, msns){
        let ss = book.sheets
        let mss = ss.filter(s => msns.includes(s.name))
        let oss = ss.filter(s => !msns.includes(s.name))
        let blocks = []
        ss.forEach((s, i) => {
            blocks = blocks.concat(s.blocks)
        })
        book.sheets = [{blocks, name: mss[0].name}].concat(oss)
    },
    drop(book, sns){
        book.sheets = book.sheets.filter(a => !sns.includes(a.name))
    },
    normalize(book){
        let ss = book.sheets
        ss.forEach((s, i) => {
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
    }
}

export default {
    ColumnUtil, BlockUtil, SheetUtil
}