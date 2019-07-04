/**
 * Created by denishuang on 2019/7/4.
 */

export default {
    mergeBlock(blocks, extras){
        let ds = []
        blocks.forEach((b, i) => {
            b.data.forEach((d, j) => {
                ds.push(Object.assign({block: `block${1 + i}`}, extras, d))
            })
        })
        let fs = blocks[0].fields
        if (!fs.find(a => a.name === 'block')) {
            fs.push({name: 'block', type: 'string'})
        }
        if(extras){
            Object.keys(extras).forEach( k => {
                if (!fs.find(a => a.name === k)) {
                    fs.push({name: k, type: typeof extras[k]})
                }
            })
        }
        return [{count: ds.length, data: ds, fields: fs}]
    },
    mergeSheet(sheets){
        let data = []
        let fields = sheets[0].blocks[0].fields
        sheets.forEach((s,i) => {
             let block = this.mergeBlock(s.blocks, {sheet:`sheet${1+i}`})[0]
             data = data.concat(block.data)
        })
        return [{blocks:[{count:data.length, data, fields}]}]
    }
}