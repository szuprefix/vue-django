/**
 * Created by denishuang on 2018/8/1.
 */

import axios from '../configs/axios'
import {Register} from './app_model'

let translater = {
    tmap: {},
    getMap: function (appModelName) {
        let modelConfig = Register.getConfig(appModelName)
        return axios.get(`/${appModelName.replace(".", "/")}/?page_size=1000`).then(({data}) => {
            let rs = data.results
            this.tmap[appModelName] = rs
            return rs
        })
    }
}

export default translater