/**
 * Created by denishuang on 2019/8/25.
 */

export default function (items, templates, normalize) {
    return items.map((a) => {
        let d = {}
        if (typeof a === 'string' || a instanceof String) {
            Object.assign(d, templates[a])
            d.name = a
        } else if (a instanceof Array) {
            d = a
        } else {
            Object.assign(d, templates[a.name], a)
        }
        if (normalize) {
            d = normalize(d)
        }
        return d
    })
}
