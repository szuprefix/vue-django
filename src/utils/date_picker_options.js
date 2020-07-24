/**
 * Created by denishuang on 2018/7/6.
 */

import dateUtil from 'element-ui/src/utils/date'
export var today = function () {
    let d = new Date()
    d.setHours(0)
    d.setMinutes(0)
    d.setSeconds(0)
    return d
}

export var addDays = function (d, days) {
    d.setTime(d.getTime() + day_seconds * days)
    return d
}
const DFMT = 'yyyy-MM-ddTHH:mm:ss+08:00'
// const DFMT0 = "yyyy-MM-ddT00:00:00+08:00"

export var recent_nday = function (n) {
    const end = new Date()
    const start = new Date()
    addDays(start, n && -n)
    return [dateUtil.format(start, DFMT), dateUtil.format(end, DFMT)]
}

const day_seconds = 3600 * 1000 * 24
export var options_with_time = {
    shortcuts: [{
        text: '最近一天',
        onClick(picker) {
            picker.$emit('pick', recent_nday(1))
        }
    }, {
        text: '最近一周',
        onClick(picker) {
            picker.$emit('pick', recent_nday(7))
        }
    }, {
        text: '最近一个月',
        onClick(picker) {

            picker.$emit('pick',recent_nday(30))
        }
    }, {
        text: '最近三个月',
        onClick(picker) {
            picker.$emit('pick', recent_nday(90))
        }
    }]
}

export var period_today = function () {
    const end = today()
    const start = today()
    addDays(end, 1)
    return [dateUtil.format(start, DFMT), dateUtil.format(end, DFMT)]
}

export var period_yesterday=function () {
    const end = today()
    const start = today()
    addDays(start, -1)
    return [dateUtil.format(start, DFMT), dateUtil.format(end, DFMT)]
}

export var period_this_week=function () {
    const end = today()
    const start = today()
    let wd = end.getDay()
    wd = wd == 0 ? 7 : wd
    addDays(end, 8 - wd)
    addDays(start, 1 - wd)
    return [dateUtil.format(start, DFMT), dateUtil.format(end, DFMT)]
}
export var period_las_week=function () {
    const end = today()
    const start = today()
    let wd = end.getDay()
    wd = wd == 0 ? 7 : wd
    addDays(end, 1 - wd)
    addDays(start, -6 - wd)
    return [dateUtil.format(start, DFMT), dateUtil.format(end, DFMT)]
}
export var period_this_month=function () {
    const end = today()
    const start = today()
    end.setDate(1)
    addDays(end, 31)
    end.setDate(1)
    start.setDate(1)
    return [dateUtil.format(start, DFMT), dateUtil.format(end, DFMT)]
}
export var period_last_month=function () {
    const end = today()
    const start = today()
    end.setDate(1)
    start.setDate(1)
    addDays(start, -1)
    start.setDate(1)
    return [dateUtil.format(start, DFMT), dateUtil.format(end, DFMT)]
}
export var options_without_time = {
    shortcuts: [{
        text: '今天',
        onClick(picker) {
            picker.$emit('pick', period_today())
        }
    }, {
        text: '昨天',
        onClick(picker) {

            picker.$emit('pick',period_yesterday())
        }
    }, {
        text: '本周',
        onClick(picker) {
            picker.$emit('pick', period_this_week())
        }
    }, {
        text: '上周',
        onClick(picker) {
            picker.$emit('pick',period_las_week())
        }
    }, {
        text: '本月',
        onClick(picker) {

            picker.$emit('pick', period_this_month())
        }
    }, {
        text: '上月',
        onClick(picker) {
            picker.$emit('pick', period_last_month())
        }
    }]
}

export default options_with_time
