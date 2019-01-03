/**
 * Created by denishuang on 2017/7/13.
 */
import Vue from 'vue'
import Vuex from 'vuex'
import apps from '@/configs/apps'
import menus from '@/configs/menus'
Vue.use(Vuex)
const state = {
    bus: new Vue(),
    user: {},
    apps,
    menus,
    system_name: '',
    logo:require('../assets/logo.png'),
}

var store = new Vuex.Store({
    state: state,
    mutations: {
        setUser(state, payload){
            // console.log(payload)
            state.user = payload
            state.bus.$emit("get-user-info", payload)
        },
        clearUser(state){
            state.user = {}
            state.bus.$emit("user-logout")
        }
    },
    actions: {
        getUserInfo (context){
            return Vue.http.get("/auth/user/current/").then(({data}) => {
                context.commit("setUser", data)
                return data
            })
        },
        logout (context){
            return Vue.http.post("/auth/user/logout/").then(({data}) => {
                context.commit("clearUser")
                return data
            })
        }
    },
    plugins: []
})
// Vue.prototype.$store = Vue.store =store
// store.dispatch("getUserInfo").catch((e) => {console.error(e)})
export default store
