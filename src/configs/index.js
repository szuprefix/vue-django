/**
 * Created by denishuang on 2017/9/27.
 */
import Vue from 'vue'
import Vuex from 'vuex'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
Vue.use(ElementUI)
Vue.use(Vuex)
import apps from './apps'
import axios from './axios'
import errors from './errors'
export default {
    apps,
    axios,
    errors
}