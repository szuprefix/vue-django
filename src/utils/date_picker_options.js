/**
 * Created by denishuang on 2018/7/6.
 */

function today() {
    let d = new Date()
    d.setHours(0)
    d.setMinutes(0)
    d.setSeconds(0)
    return d
}

function addDays(d, days) {
    d.setTime(d.getTime() + day_seconds * days)
    return d
}
const day_seconds = 3600 * 1000 * 24
export var options_with_time = {
    shortcuts: [{
        text: '最近一天',
        onClick(picker) {
            const end = new Date()
            const start = new Date()
            addDays(start, -1)
            picker.$emit('pick', [start, end])
        }
    }, {
        text: '最近一周',
        onClick(picker) {
            const end = new Date()
            const start = new Date()
            addDays(start, -7)
            picker.$emit('pick', [start, end])
        }
    }, {
        text: '最近一个月',
        onClick(picker) {
            const end = new Date()
            const start = new Date()
            addDays(start, -30)
            picker.$emit('pick', [start, end])
        }
    }, {
        text: '最近三个月',
        onClick(picker) {
            const end = new Date()
            const start = new Date()
            addDays(start, -90)
            picker.$emit('pick', [start, end])
        }
    }]
}

export var options_without_time = {
    shortcuts: [{
        text: '今天',
        onClick(picker) {
            const end = today()
            const start = today()
            addDays(end, 1)
            picker.$emit('pick', [start, end])
        }
    }, {
        text: '昨天',
        onClick(picker) {
            const end = today()
            const start = today()
            addDays(start, -1)
            picker.$emit('pick', [start, end])
        }
    }, {
        text: '本周',
        onClick(picker) {
            const end = today()
            const start = today()
            let wd = end.getDay()
            wd = wd == 0 ? 7: wd
            addDays(end, 8 - wd)
            addDays(start, 1 - wd)
            picker.$emit('pick', [start, end])
        }
    }, {
        text: '上周',
        onClick(picker) {
            const end = today()
            const start = today()
            let wd = end.getDay()
            wd = wd == 0 ? 7: wd
            addDays(end, 1 - wd)
            addDays(start, -6 - wd)
            picker.$emit('pick', [start, end])
        }
    }, {
        text: '本月',
        onClick(picker) {
            const end = today()
            const start = today()
            end.setDate(1)
            addDays(end, 31)
            end.setDate(1)
            start.setDate(1)
            picker.$emit('pick', [start, end])
        }
    }, {
        text: '上月',
        onClick(picker) {
            const end = today()
            const start = today()
            end.setDate(1)
            start.setDate(1)
            addDays(start, -1)
            start.setDate(1)
            picker.$emit('pick', [start, end])
        }
    }]
}

export default options_with_time