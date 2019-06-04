import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export const constRoutes = [
    {
        path: '/auth/login/',
        meta: {title: '登录', layout: 'main'},
        component: resolve => require(['../views/auth/login.vue'], resolve)
    },
    {
        path: '/auth/change_password/',
        meta: {title: '修改密码'},
        component: resolve => require(['../views/auth/change_password.vue'], resolve)
    },
    {
        path: '/unimplement/',
        meta: {title: '功能开发中'},
        component: resolve => require(['../views/unimplemented.vue'], resolve)
    }
]
let router = new Router({
    routes: constRoutes
})


export default router

export var genModelRouters = function (apps, importFunc, defaultLayout) {
    let _import = importFunc
    let ars = []
    Object.keys(apps).forEach((a) => {

        const app = apps[a]
        const ptitle = app.verbose_name
        const picon = app.icon
        const prole = app.roles
        const hidden = app.hidden === 'true'
        if (hidden) {
            return
        }
        const parent = {
            // component: defaultLayout,
            alwaysShow: true,
            name: a,
            path: `/${a}`,
            redirect: 'noredirect',
            meta: {
                title: ptitle,
                icon: picon,
                permissions: [`${a}.*`]
            }
        }


        let models = apps[a].models
        const children = []
        Object.keys(models).forEach((m) => {
            let model = models[m]
            let mname = model.verbose_name
            let actions = model.actions || []
            let itemActions = model.item_actions || []
            children.push({
                path: `/${a}/${m}/`,
                name: `${a}-${m}-list`,
                meta: {
                    title: `${mname}列表`,
                    model,
                    icon: model.icon,
                    permission: ['*']
                },
                component: _import(`${a}/${m}/list`)
            })
            actions.forEach((action) => {
                // console.log(`/${a}/${m}/${action.name}/`)
                children.push({
                    path: `/${a}/${m}/${action.name}/`,
                    name: `${a}-${m}-${action.name}`,
                    meta: {
                        title: `${action.verbose_name}${mname}`,
                        model,
                        icon: model.icon,
                        permissions: action.permission || []
                    },
                    component: _import(`${a}/${m}/${action.name}`)
                })
            })
            children.push({
                path: `/${a}/${m}/:id/`,
                name: `${a}-${m}-edit`,
                meta: {
                    title: `编辑${mname}`,
                    model,
                    icon: model.icon,
                    permissions: ['change', 'add']
                },
                component: _import(`${a}/${m}/edit`)
            })
            itemActions.forEach((action) => {
                children.push({
                    path: `/${a}/${m}/:id/${action.name}/`,
                    name: `${a}-${m}-${action.name}`,
                    meta: {
                        title: `${action.verbose_name}${mname}`,
                        model,
                        icon: model.icon,
                        permissions: action.permission || []
                    },
                    component: _import(`${a}/${m}/${action.name}`)
                })
            })
        })
        if (children.length > 0) {
            parent.children = children
        }

        ars.push(parent)
    })
    return ars
}



