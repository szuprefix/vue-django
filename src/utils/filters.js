/**
 * Created by denishuang on 2017/11/16.
 */
import moment from 'moment'
moment.locale('zh_CN')
export function date2now(d) {
    "use strict";
    return moment(d).toNow()
}

export function date(d) {
    "use strict";
    let md = moment(d)
    let now = moment()
    return md.format(md.year() == now.year() ? 'MM-DD hh:mm' : 'YYYY-MM-DD hh:mm')
    if (md.isBefore(moment().subtract(1, 'days'))) {
        return md.format('YYYY-MM-DD hh:mm')
    } else {
        return md.toNow()
    }
}

export default {
    date2now,
    date
}