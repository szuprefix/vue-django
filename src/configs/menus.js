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
    let others = {}
    let menuItems = {}
    menus.forEach((a) => {
        let app = apps[a]
        let models = menus[a]

        if (!models) {
            models = Object.keys(app.models)
        }
        if (typeof models == 'string') {
            models = models.split(',')
        }
        let subItems = []
        models.forEach((m) => {
            let menu = m
            let model = app.models[m]
            if (typeof m == 'string') {
                let mn = `${a}.${m}`
                let hidden = model.hidden
                if (hidden === undefined && modelPermissions) {
                    hidden = (mn in modelPermissions) ? false : true
                }
                menu = {name: model.verbose_name, icon: model.icon || 'file', url: `/${a}/${m}/`, hidden}
            }
            if (model.menu) {
                others[model.menu] = others[model.menu] || []
                others[model.menu].push(menu)
            } else {
                subItems.push(menu)
            }
        })
        let name =app.verbose_name
        menuItems[name]={name , items: subItems, icon: app.icon || 'file', hidden: app.hidden}
    })
    for(var k in others) {
        menuItems[k]={name:k, items: others[k]}
    }
    return menuItems
}

let menus = {
    items: []
}
export default menus