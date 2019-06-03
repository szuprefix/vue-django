import router from './index'
import {asyncRouterMap} from './index'
import store from '../store'
import {Message} from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css'// progress bar style
import {getToken, setToken, getLoginMode, removeToken} from '../utils/auth' // getToken from cookie

NProgress.configure({showSpinner: false})// NProgress Configuration
const loginUrl = '/auth/login/'

router.beforeEach((to, from, next) => {
        NProgress.start() // start progress bar
        let loginRequired = (to.path === loginUrl) ? false : (to.matched.some(record => record.meta.loginRequired !== false))
        if (!loginRequired) {
            next()
        } else {
            let token = getToken()
            if (token && !store.state.token) {
                store.state.token = token
                setToken(token)
            }
            let user = store.state.user
            let logined = user && user.id
            if (!logined) {
                store.dispatch('getUserInfo').then(({data}) => {
                    user = store.state.user
                    const roles = user.groups
                    // router.addRoutes(asyncRouterMap) //todo: make dynamics routers
                    next({...to, replace: true}) // hack方法 确保addRoutes已完成 ,set the replace: true so the navigation will not leave a history record
                }).catch((error) => {
                    Message.error('身份认证失败, 请重新登录')
                    next({path: loginUrl, query: {redirect: to.fullPath}})
                })
            } else {
                // 权限判断
                const allowRoles = to.meta.roles
                let isAllowed = true

                if (isAllowed) {
                    next()
                } else {
                    next({path: '/notallow/'})
                }
            }
        }
    }
)

router.afterEach(() => {
    NProgress.done()
})

router.onError((err) => {
    NProgress.done()
    console.error(err)
    Message.error(`发生异常:${err}`)
})