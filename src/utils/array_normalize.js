/**
 * Created by denishuang on 2019/8/25.
 */

export default function (items, templates, normalize) {
    // console.log(templates)
    // if(!(templates instanceof Array)) {
    //     templates = [templates]
    // }
    return items.map((a, i) => {
        let d = {}
        if (typeof a === 'string' || a instanceof String) {
            Object.assign(d, templates[a])
            d.name = a
        } else if (a instanceof Array) {
            d = a
        } else {
            // templates.forEach(t => {
            //     Object.assign(d, t[a.name])
            // })
            Object.assign(d, templates[a.name], a)
            // console.log(d)
        }
        if (normalize) {
            d = normalize(d, i)
        }
        return d
    })
}
