import Cookies from 'js-cookie'

import axios from 'axios'

const TokenKey = 'access_token'

export function getToken () {
    return Cookies.get(TokenKey)
}

export function setToken (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    return Cookies.set(TokenKey, token)
}

export function removeToken () {
    delete axios.defaults.headers.common['Authorization']
    return Cookies.remove(TokenKey)
}

export function login (username, password) {
    axios.post('/auth/user/login/', {username, password}).then(({data}) => {
        let token = data.token.access
        setToken(token)
    })
}

export function logout () {
    return axios.get('/auth/user/logout/').then(({data}) => {
        removeToken()
        return data
    })
}
export default {
    getToken,
    setToken,
    removeToken,
    login,
    logout
}
