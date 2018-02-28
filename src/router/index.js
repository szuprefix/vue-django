import Vue from 'vue'
import Router from 'vue-router'

import store from '../store'
Vue.use(Router)
let router = new Router({
    routes: [
        {
            path: '/auth/login/',
            meta: {title: '登录'},
            component: require('../views/auth/login.vue')
        },
        {
            path: '/auth/change_password/',
            meta: {title: '修改密码'},
            component: require('../views/auth/change_password.vue')
        },
        {
            path: '/model/:model/',
            meta: {title: '列表'},
            component: require('../components/model/ModelListView.vue')
        },
        {
            path: '/model/:model/create/',
            meta: {title: '新建'},
            component: require('../components/model/ModelCreateView.vue')
        },
        {
            path: '/model/:model/:id/update/',
            meta: {title: '修改'},
            component: require('../components/model/ModelUpdateView.vue')
        },
        {
            path: '/model/:model/:id/',
            meta: {title: '详情'},
            component: require('../components/model/ModelDetailView.vue')
        }
    ]
})



export default router
