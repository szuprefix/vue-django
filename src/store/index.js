/**
 * Created by denishuang on 2017/7/13.
 */
// import Vue from 'vue'
import { createStore } from 'vuex'
import {createApp} from 'vue'

// import Vuex from 'vuex'
import apps from '@/configs/apps'
import {logout} from '../utils/auth'
import user from './modules/user'
import party from './modules/party'
import dailyLog from '../utils/dailylog'
import {UserStorage} from '../utils/user_storage'
import logo from '../assets/logo.png'
// Vue.use(Vuex)
import mitt from 'mitt'
const state = {
    bus: mitt(),
    dailyLog,
    apps,
    system_name: '',
    logo
}

var store = createStore({
    state: state,
    modules: {
        user,
        party
    },
    plugins: []
})
// Vue.prototype.$store = Vue.store =store
// store.dispatch('getUserInfo').catch((e) => {console.error(e)})
export default store
