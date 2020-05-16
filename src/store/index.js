/**
 * Created by denishuang on 2017/7/13.
 */
import Vue from 'vue'
import Vuex from 'vuex'
import apps from '@/configs/apps'
import {logout} from '../utils/auth'
import user from './modules/user'
import party from './modules/party'
import dailyLog from '../utils/dailylog'
import {UserStorage} from '../utils/user_storage'
Vue.use(Vuex)
const state = {
    bus: new Vue(),
    dailyLog,
    apps,
    system_name: '',
    logo: require('../assets/logo.png')
}

var store = new Vuex.Store({
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
