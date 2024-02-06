import Vue from 'vue'
import Router from 'vue-router'
import {routerMode} from '@/configs/apps'

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
    mode: routerMode,
    routes: constRoutes
})

export function import_or_use_template(path, template) {
    return () => {
        return import('@/views/' + path + '.vue').catch((e) => {
            let b = e.toString().includes('Cannot find module')
            if (b) {
                return import(`../views/model/${template}.vue`)
            }
            else {
                throw e
            }
        })
    }
}

export function setDefaultLayout(rs) {
    let ps =location.href.split(/app_default_layout=([^#&]*)/g)
    if(ps.length<3) {
        return
    }
    let dl = ps[1]
    rs.forEach(r => {
        if(!r.meta.layout) {
            r.meta.layout = dl
        }
        if(r.children) {
            setDefaultLayout(r.children)
        }
    })
}

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
            let itemActions = model.itemActions || []
            children.push({
                path: `/${a}/${m}/`,
                name: `${a}-${m}-list`,
                meta: {
                    title: `${mname}列表`,
                    model,
                    icon: model.icon,
                    permission: ['*']
                },
                component: import_or_use_template(`${a}/${m}/list`, 'list')
            })
            actions.forEach((action) => {
                // console.log(`/${a}/${m}/${action.name}/`)
                children.push({
                    path: `/${a}/${m}/${action.name}/`,
                    name: `${a}-${m}-${action.name}`,
                    meta: {
                        title: `${mname}${action.verbose_name || action.title || action.label}`,
                        model,
                        icon: model.icon,
                        permissions: action.permission || []
                    },
                    component: import_or_use_template(`${a}/${m}/${action.name}`, action.name)
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
                component: import_or_use_template(`${a}/${m}/edit`, 'edit')
            })
            itemActions.forEach((action) => {
                children.push({
                    path: `/${a}/${m}/:id/${action.name}/`,
                    name: `${a}-${m}-${action.name}`,
                    meta: {
                        title: `${mname}${action.verbose_name || action.title}`,
                        model,
                        icon: model.icon,
                        permissions: action.permission || []
                    },
                    component: import_or_use_template(`${a}/${m}/${action.name}`, action.name)
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



