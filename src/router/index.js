import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)
let router = new Router({
    routes: [
        {
            path: '/auth/login/',
            meta: {title: '登录'},
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
