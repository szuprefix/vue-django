import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)
// Router.prototype.registerAppModelRoutes= function(apps, routes){
//     Object.keys(apps).forEach((a) => {
//         let models = apps[a].models
//         Object.keys(models).forEach((m) => {
//             let model = models[m]
//             let mname = model.verbose_name
//             routes.push({
//                 name: `/${a}/${m}/`,
//                 path: `/${a}/${m}/`,
//                 meta: {title: `${mname}列表`},
//                 component: resolve => require([`../views/${a}/${m}/list.vue`], resolve)
//             })
//             routes.push({
//                 name: `/${a}/${m}/edit/`,
//                 path: `/${a}/${m}/:id/`,
//                 meta: {title: `编辑${mname}`},
//                 component: resolve => require([`../views/${a}/${m}/edit.vue`], resolve)
//             })
//         })
//     })
// }
let router = new Router({
    routes: [
        {
            path: '/auth/login/',
            meta: {title: '登录', layout:'main'},
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
})



export default router
