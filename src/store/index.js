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
            state.user = payload.user
        },
        clearUser(state){
            state.user = {}
            state.bus.$emit("user-logout")
        }
    },
    actions: {
        getUserInfo (context){
            Vue.http.post("get_user_info/").then(({data}) => {
                if (data.code === 0) {
                    context.commit("setUser", data.data)
                }
            })
        },
        logout (context){
            Vue.http.post("logout/").then(({data}) => {
                if (data.code === 0) {
                    context.commit("clearUser")
                }
            })
        }
    },
    plugins: []
})
// Vue.prototype.$store = Vue.store =store
store.dispatch("getUserInfo")
export default store
