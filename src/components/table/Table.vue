<template>
    <el-table slot="reference" :data="_value" ref="table" :span-method="spanMethod" v-loading="loading"
              :element-loading-text="loading" :cell-class-name="elOptions.cellClassName"
              :row-class-name="elOptions.rowClassName"  @row-dblclick="onRowDblClick"
              :height="elOptions.height" :max-height="elOptions.maxHeight" :stripe="elOptions.stripe"
              :border="elOptions.border" @selection-change="elOptions.onSelectionChange">
        <template slot="left"></template>
        <table-column :field="f" v-for="f in _items" :key="f.name"></table-column>
        <el-table-column label="" align="right" v-if="rowActions || topActions">
            <template slot="header" slot-scope="scope" v-if="topActions">
                <actions :items="_topActions" :context="scope" :map="avairableActions"></actions>
            </template>
            <template slot-scope="scope" v-if="rowActions">
                <actions :items="_rowActions" :context="scope" class="hover-show" trigger="hover"
                         :map="avairableActions"></actions>
            </template>
        </el-table-column>

        <slot name="right">
        </slot>
    </el-table>
</template>
<script>
    import {percent, toThousandslsFilter} from '../../utils/filters'
    import {sortBy} from 'lodash'
    import TableColumn from './TableColumn.vue'
    import Actions from '../layout/Actions.vue'
    import {genSpanMap, flatten} from './Table'
    import array_normalize from '../../utils/array_normalize'


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
            items: Array,
            topActions: {
                type: Array, default: () => {
                    return ['download']
                }
            },
            rowActions: {
                type: Array, default: () => {
                    return []
                }
            },
            dblClickAction: String
        },
        data () {
            return {
                loading: false,
                avairableActions: {
                    'download': {
                        icon: 'download',
                        title: '导出',
                        do: this.dumpExcelData
                    }
                }
            }
        },
        components: {TableColumn, Actions},
        created () {
//            console.log(this._rowActions)
        },
        methods: {
            excelFormat(data){
                let ds = data.map((d) => {
                    return this.fieldNames.map((a) => d[a])
                })
                return [this.fieldNames].concat(ds)
            },
            excelGetAllData () {
                return Promise.resolve(this.value)
            },
            dumpExcelData(){
                this.loading = '正在导出'
                let opts = this.options
                let excelGetAllData = opts.excelGetAllData ||  this.excelGetAllData
                let excelFormat = opts.excelFormat || this.excelFormat
                excelGetAllData().then((data) => {
                    this.loading = '正在加载excel模块'
                    import('xlsx').then(XLSX => {
                        this.loading = '正在导出excel'
                        let wb = XLSX.utils.book_new()
                        let sds = excelFormat(data)
                        let ws = XLSX.utils.aoa_to_sheet(sds)
                        XLSX.utils.book_append_sheet(wb, ws, 'Sheet 1')
                        XLSX.writeFile(wb, `${this.options.title || '导出数据'}.xlsx`)
                        this.loading = false
                    })
                })


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
            normalizeActions(actions){
//                console.log(this._avairableActions)
                return array_normalize(actions, this._avairableActions, (a) => {
                    if (a instanceof Array) {
                        return this.normalizeActions(a)
                    } else {
                        return a
                    }
                })
            },
            normalizeItem(f){
                f.type = f.type || 'string'
                f.align = f.align || ['decimal', 'number', 'percent', 'integer'].includes(f.type) && 'right' || 'left'
                f.widget = f.widget || this.cellWidget
                f.headerWidget = f.headerWidget || this.headerWidget
                f.formatter = f.formatter || this.genDefaultFormater(f)
                if (f.subColumns) {
                    f.subColumns = f.subColumns.map(i => this.normalizeField(i))
                }
                return f
            },
            onRowDblClick (row, column, cell, event) {
                if(this.dblClickAction) {
                    let action = this._avairableActions[this.dblClickAction]
                    if (action && action.show()) {
                        action.do({row, column, cell, event})
                    }
                }
            }
        },
        computed: {
            _topActions () {
                return this.normalizeActions(this.topActions)
            },
            _rowActions () {
                return this.normalizeActions(this.rowActions)
            },
            _items(){
                return array_normalize(this.items, {}, (i) => {
                    return this.normalizeItem(i)
                })
            },
            _avairableActions () {
                return Object.assign({}, this.avairableActions, this.options.avairableActions)
            },
            fieldNames (){
                let fs = flatten(this._items, 'subColumns')
                return fs.map(a => a.name)
            },
            _value(){
                if (this.group) {
                    return sortBy(this.value, this.fieldNames)
                }
                return this.value
            },
            spanMap () {
                return genSpanMap(this._value, this.fieldNames)
            },

            elOptions () {
                return this.options.elTable || {}
            }
        }
    }
</script>
