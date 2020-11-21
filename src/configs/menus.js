/**
 * Created by denishuang on 2018/4/1.
 */

/*

 {exam:'paper,score',
 school:['clazz','student']
 course:null
 }
 */
export function genMenusFromApps(apps, menus, modelPermissions) {
    if (!menus) {
        menus = Object.keys(apps)
    } else if (typeof menus == 'object') {
        menus = Object.keys(menus)
    }
    return menus.map((a) => {
        let app = apps[a]
        let models = menus[a]

        if (!models) {
            models = Object.keys(app.models)
        }
        if (typeof models == 'string') {
            models = models.split(',')
        }
        let items = models.map((m) => {
            let menu = m
            if (typeof m == 'string') {
                let model = app.models[m]
                let mn = `${a}.${m}`
                let hidden = model.hidden
                if(hidden === undefined &&  modelPermissions) {
                    hidden = (mn in modelPermissions)? false:true
                }
                menu = {name: model.verbose_name, icon: model.icon || 'file', url: `/${a}/${m}/`, hidden}
            }
            return menu
        })
        let hidden = !items.find(a => !a.hidden) || app.hidden
        return {name: app.verbose_name, items, icon:app.icon || 'file', hidden}
    })
}

let menus = {
    items: []
}
export default menus