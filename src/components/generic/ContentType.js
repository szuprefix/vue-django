/**
 * Created by denishuang on 2019/10/15.
 */

import axios from '../../configs/axios'
import Model from "../model/Model";
export default {
    idMap: undefined,
    model: Model('contenttypes.contenttype'),
    loading: false,
    getAppModel (id) {
        if (this.idMap === undefined) {
            return
        }
        let d = this.idMap[id]
        return Model(`${d.app_label}.${d.model}`)
    },
    loadIdMap () {
        if (this.idMap === undefined && this.loading === false) {
            this.loading = true
            axios.get(`${this.model.getListUrl()}?page_size=1000`).then(({data}) => {
                return data.results
            }).then(ls => {
                let d = {}
                ls.forEach(a => {
                    d[a.id] = a
                })
                this.idMap = d
                this.loading = false
                // console.log(this.idMap)
            }).catch((e) => {
                this.loading = false
            })
        }
    }
}