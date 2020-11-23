import Vue from 'vue'

const party = {
    state: {
        name: null,
        logo: null
    },

    mutations: {
        setParty(state, payload){
            Object.assign(state, payload)
        }
    },
    actions: {
        getPartyInfo ({commit, rootState}){
            return Vue.http.get("/saas/party/current/").then(({data}) => {
                commit("setParty", data)
                rootState.bus.$emit('party-ready', data)
                return data
            })
        }
    }
}

export default party
