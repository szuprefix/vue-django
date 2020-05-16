/**
 * Created by denishuang on 2020/5/15.
 */
import {UserStorage} from '../../utils/user_storage'
import {logout} from '../../utils/auth'
export default {
    state: {
        storage: UserStorage()
    },
    mutations: {
        setUser (state, payload) {
            Object.assign(state, payload, {storage: UserStorage(payload.id)})
        },
        clearUser (state) {
            state.user = {}
        }
    },
    actions: {
        getUserInfo ({commit, rootState}) {
            return Vue.http.get('/auth/user/current/').then(({data}) => {
                commit('setUser', data)
                rootState.bus.$emit('get-user-info', data)
                return data
            })
        },
        logout ({commit, rootState}) {
            return logout().then((data) => {
                commit('clearUser')
                rootState.bus.$emit('user-logout')
                return data
            })
        }
    }
}
