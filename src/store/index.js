/**
 * Created by denishuang on 2017/7/13.
 */
import Vue from 'vue'
import Vuex from 'vuex'
import apps from '../configs/apps'
Vue.use(Vuex)
const state = {
    bus: new Vue(),
    user: {},
    apps: apps
}

var store = new Vuex.Store({
    state: state,
    mutations: {
        setUser(state, payload){
            // console.log(payload)
            state.user = payload
        },
        clearUser(state){
            state.user = {}
            state.bus.$emit("user-logout")
        }
    },
    actions: {
        getUserInfo (context){
            return Vue.http.get("/saas/worker/current/").then(({data}) => {
                context.commit("setUser", data)
            })
        },
        logout (context){
            return Vue.http.post("/auth/user/logout/").then(({data}) => {
                context.commit("clearUser")
            })
        }
    },
    plugins: []
})
// Vue.prototype.$store = Vue.store =store
store.dispatch("getUserInfo")
export default store
