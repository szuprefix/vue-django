<template>
    <el-table :data="_value" ref="table" :span-method="spanMethod" :cell-class-name="options.cellClassName">
        <!--<el-table-column :prop="f.name" :column-key="f.name" :label="f.label || f.name"-->
        <!--:min-width="f.min_width" :width="f.width" :formater="f.formater"-->
        <!--:align="f.align" :class-name="f.type"-->
        <!--:type="f.type" v-for="f in _fields"-->
        <!--:key="f.name">-->
        <!--<template slot-scope="{row}">-->
        <!--<component :is="f.widget" v-model="row" :prop="f.name" :field="f"-->
        <!--v-if="f.widget && typeof f.widget == 'object'"></component>-->
        <!--<span v-else-if="f.widget && typeof f.widget == 'function'" v-html="f.widget(row)"></span>-->
        <!--<template v-else>{{row[f.name]}}</template>-->
        <!--</template>-->
        <!--</el-table-column>-->
        <data-table-column :field="f" v-for="f in _fields" :key="f.name"></data-table-column>
    </el-table>
</template>
<script>
    import {percent, toThousandslsFilter} from '../../../utils/filters'
    import {sortBy} from 'lodash'
    import DataTableColumn from './DataTableColumn.vue'
    function flatten(ns, children_field_name){
        let r = []
        ns.forEach(a => {
            let sns = a[children_field_name]
            if(sns){
                r = r.concat(flatten(sns, children_field_name))
            }else{
                let n = Object.assign({}, a)
                // delete n[children_field_name]
                r.push(n)
            }
        })
        return r
    }

    export default{
        props: {
            value: Array,
            defaultWidget: [Function, Object],
            group: false,
            options:{type:Object, default:() => {}},
            fields: {
                type: Array, default: function () {
                    return [{name: '__str__', label: '名称'}]
                }
            },
        },
        data () {
            return {}
        },
        components: {DataTableColumn},
        methods: {
            spanMethod ({row, column, rowIndex, columnIndex}){
                if (!this.group) {
                    return
                }
                let m = this.spanMap
                let rowspan = m[rowIndex][columnIndex]
                return {rowspan, colspan: rowspan > 0 ? 1 : 0}
            },
            genDefaultFormater (f) {
                let df = (v) => v
                let func = ['decimal', 'number', 'integer'].includes(f.type) && toThousandslsFilter || ['percent'].includes(f.type) && percent || df
                return (row, column, cellValue, index) => func(cellValue)
            },
            normalizeField(i){
                let f = {}
                if (typeof i == 'string') {
                    Object.assign(f, {name: i, label: i})
                } else {
                    Object.assign(f, i)
                }
                f.type = f.type || 'string'
                f.align = f.align || ['decimal', 'number', 'percent', 'integer'].includes(f.type) && 'right' || 'left'
                f.widget = f.widget || this.defaultWidget
                f.formatter = f.formatter || this.genDefaultFormater(f)
                if (f.subColumns) {
                    f.subColumns = f.subColumns.map(i => this.normalizeField(i))
                }
                return f
            }
        },
        computed: {
            _fields(){
                return this.fields.map((i) => {
                    return this.normalizeField(i)
                })
            },
            fieldNames (){
                let fs = flatten(this._fields, 'subColumns')
                return fs.map(a => a.name)
            },
            spanMap () {
                let vs = this._value
                let fs = this.fieldNames
                let m = {}
                let lm = {}
                let pm = {}
                vs.forEach((r, i) => {
                    m[i] = {}
                    let b = true
                    fs.forEach((f, j) => {
                        if (b == false) {
                            lm[f] = undefined
                        }
                        if (r[f] !== lm[f]) {
                            let c = pm[f] || 0
                            m[i - c][j] = c
                            pm[f] = 0
                            b = false
                        }
                        pm[f] = pm[f] + 1
                        m[i][j] = 0
                        lm[f] = r[f]
                    })
                })
                fs.forEach((f, j) => {
                    let c = pm[f] || 1
                    m[vs.length - c][j] = c
                })
//                console.log(m)
                return m
            },
            _value(){
                if (this.group) {
                    return sortBy(this.value, this.fieldNames)
                }
                return this.value
            }
        }
    }
</script>
<style scoped></style>
