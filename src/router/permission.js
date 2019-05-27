import router from './index'
import {asyncRouterMap} from './index'
import store from '../store'
import {Message} from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css'// progress bar style
import {getToken, setToken, getLoginMode, removeToken} from '../utils/auth' // getToken from cookie

NProgress.configure({showSpinner: false})// NProgress Configuration
const loginUrl = '/auth/login/'
const whiteList = [loginUrl,'/test/']// no redirect whitelist

router.beforeEach((to, from, next) => {
    NProgress.start() // start progress bar
    let token = getToken()
    if (token) { // determine if there has token
        // has token
        if (!store.state.token) {
            store.state.token = token
            // console.log(`set token ${token}`)
            setToken(token)
        }

        if (to.path === loginUrl) {
            next()
            // next({ path: '/' })
            NProgress.done() // if current page is dashboard will not trigger	afterEach hook, so manually handle it
        } else {
            let user = store.state.user
            // console.log(user)
            if (!user || !user.id) { // 判断当前用户是否已拉取完user_info信息


                store.dispatch('getUserInfo').then(({data}) => {
                    user = store.state.user
                    const roles = user.groups
                    // router.addRoutes(asyncRouterMap) //todo: make dynamics routers
                    next({...to, replace: true}) // hack方法 确保addRoutes已完成 ,set the replace: true so the navigation will not leave a history record
                }).catch((error) => {
                    console.error(error)
                    Message.error('身份认证失败, 请重新登录')
                    next({path: loginUrl})
                })
            } else {
                // 权限判断
                const allowRoles = to.meta.roles
                let isAllowed = true

                if (isAllowed) {
                    next()
                } else {
                    console.log(to.path)
                    next({path: '/notallow/'})
                }
            }
        }
    } else {
        // has no token
        console.log(to.path)
        if (whiteList.indexOf(to.path) !== -1) { // 在免登录白名单，直接进入
            next()
        } else {
            next(loginUrl) // 否则全部重定向到登录页
            NProgress.done() // if current page is login will not trigger afterEach hook, so manually handle it
        }
    }
})

router.afterEach(() => {
    NProgress.done() // finish progress bar
})
