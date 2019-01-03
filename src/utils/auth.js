import Cookies from 'js-cookie'

const TokenKey = 'access_token'

import axios from 'axios'

export function getToken() {
    return Cookies.get(TokenKey)
}

export function setToken(token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    return Cookies.set(TokenKey, token)
}

export function removeToken() {
    delete axios.defaults.headers.common['Authorization']
    return Cookies.remove(TokenKey)
}

export function login(username, password) {
    axios.post('/auth/user/login/', {username, password}).then(({data}) => {
        let token = data.token.access
        setToken(token)
    })
}

export function logout() {
    axios.get('/auth/user/logout/').then(({data}) => {
        removeToken()
    })
}
export default {
    getToken,
    setToken,
    removeToken,
    login,
    logout
}