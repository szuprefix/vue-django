<template>
    <el-table slot="reference" :data="_value" ref="table" :span-method="spanMethod" v-loading="loading"
              :element-loading-text="loading" :cell-class-name="elOptions.cellClassName"
              :height="elOptions.height" :max-height="elOptions.maxHeight" :stripe="elOptions.stripe"
              :border="elOptions.border">
        <template slot="left"></template>
        <data-table-column :field="f" v-for="f in _fields" :key="f.name"></data-table-column>
        <el-table-column label="" align="right" v-if="rowActions || topActions">
            <template slot="header" slot-scope="scope" v-if="topActions">
                <actions :items="topActions" :context="scope"></actions>
            </template>
            <template slot-scope="scope" v-if="rowActions">
                <actions :items="rowActions" :context="scope" class="hover-show" trigger="hover"></actions>
            </template>
        </el-table-column>

        <slot name="right">
        </slot>
    </el-table>
</template>
<script>
    import {percent, toThousandslsFilter} from '../../../utils/filters'
    import {sortBy} from 'lodash'
    import DataTableColumn from './DataTableColumn.vue'
    import Actions from '../Actions.vue'
    function flatten(ns, children_field_name) {
        let r = []
        ns.forEach(a => {
            let sns = a[children_field_name]
            if (sns) {
                r = r.concat(flatten(sns, children_field_name))
            } else {
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
            cellWidget: [Function, Object],
            headerWidget: [Function, Object],
            group: false,
            options: {
                type: Object, default: () => {
                    return {}
                }
            },
            fields: {
                type: Array, default: function () {
                    return [{name: '__str__', label: '名称'}]
                }
            },
        },
        data () {
            return {
                loading: false,
                topActions: [{
                    icon: 'download',
                    title: '导出',
                    do: this.dumpExcelData
                }]
            }
        },
        components: {DataTableColumn, Actions},
        methods: {
            getGridData(data){
                let ds = data.map((d) => {
                    return this.fieldNames.map((a) => d[a])
                })
                return [this.fieldNames].concat(ds)
            },
            dumpExcelData(){
                this.loading = '正在导出'
                let data = this.value
                import('xlsx').then(XLSX => {
                    let wb = XLSX.utils.book_new()
                    let sds = this.getGridData(data)
                    let ws = XLSX.utils.aoa_to_sheet(sds)
                    XLSX.utils.book_append_sheet(wb, ws, 'Sheet 1')
                    XLSX.writeFile(wb, `${this.options.title || '导出数据'}.xlsx`)
                    this.loading = false
                })

            },
            doLayout () {
                this.$refs.table.doLayout()
            },
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
                f.widget = f.widget || this.cellWidget
                f.headerWidget = f.headerWidget || this.headerWidget
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
            },
            elOptions () {
                return this.options.elTable || {}
            }
        }
    }
</script>
<style scoped></style>
