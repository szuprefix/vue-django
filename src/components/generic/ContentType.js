/**
 * Created by denishuang on 2019/10/15.
 */

import axios from '../../configs/axios'
import Model from "../model/Model";
export default {
    idMap: undefined,
    nameMap: undefined,
    model: Model('contenttypes.contenttype'),
    loading: false,
    getAppModel (id) {
        if (this.idMap === undefined) {
            return
        }
        let d = this.idMap[id]
        return Model(`${d.app_label}.${d.model}`)
    },
    getId (name) {
        return this.nameMap[name]
    },
    loadIdMap () {
        if (this.idMap === undefined && this.loading === false) {
            this.loading = true
            axios.get(`${this.model.getListUrl()}all/?page_size=1000`).then(({data}) => {
                return data.results
            }).then(ls => {
                let idm = {}
                let nm = {}
                ls.forEach(a => {
                    idm[a.id] = a
                    nm[`${a.app_label}.${a.model}`] = a.id
                })
                this.idMap = idm
                this.nameMap = nm
                this.loading = false
            }).catch((e) => {
                this.loading = false
            })
        }
    }
}
