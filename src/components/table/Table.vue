<template>
    <el-table :data="_value" ref="table" v-loading="loading"
              :element-loading-text="loading"  v-on="elListeners" v-bind="elAttrs">
        <slot name="left"></slot>
        <column :field="f" v-for="f in _items" :key="f.name"></column>
        <el-table-column label="" align="right"
                         v-if="rowActions &&  rowActions.length>0 || topActions && topActions.length>0">
            <template slot="header" slot-scope="scope" v-if="topActions">
                <actions :items="_topActions" :context="scope" :permissionFunction="$attrs.permissionFunction"
                         :map="avairableActions"></actions>
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
    import Column from './Column.vue'
    import Actions from '../layout/Actions.vue'
    import {genSpanMap, flatten} from './Table'
    import array_normalize from '../../utils/array_normalize'
    import serverResponse from '../../mixins/server_response'


    export default{
        mixins: [serverResponse],
        props: {
            value: Array,
            cellWidget: [Function, Object],
            headerWidget: [Function, Object],
            group: false,
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
                    },
                    ...this.$attrs.avairableActions
                }
            }
        },
        components: {Column, Actions},
        created () {
//            console.log(this.$attrs.avairableActions)
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
                let excelGetAllData = this.$attrs.excelGetAllData || this.excelGetAllData
                let excelFormat = this.$attrs.excelFormat || this.excelFormat
                excelGetAllData().then((data) => {
                    if(data === undefined) {
                        this.loading = false
                        return
                    }
                    this.loading = '正在加载excel模块'
                    import('xlsx').then(XLSX => {
                        this.loading = '正在导出excel'
                        let wb = XLSX.utils.book_new()
                        let sds = excelFormat(data)
                        let ws = XLSX.utils.aoa_to_sheet(sds)
                        XLSX.utils.book_append_sheet(wb, ws, 'Sheet 1')
                        XLSX.writeFile(wb, `${this.$attrs.title || '导出数据'}.xlsx`)
                        this.loading = false
                    })
                }).catch(this.onServerResponseError)


            },
            spanMethod ({rowIndex, columnIndex}){
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
                return array_normalize(actions, this.avairableActions, (a) => {
                    if (a instanceof Array) {
                        return this.normalizeActions(a)
                    } else {
                        return a
                    }
                })
            },
            normalizeItem(f){
                if(typeof f === 'string'){
                    f = {name:f}
                }
                f.type = f.type || 'string'
                f.align = f.align || ['decimal', 'number', 'percent', 'integer'].includes(f.type) && 'right' || 'left'
                f.widget = f.widget || this.cellWidget
                f.headerWidget = f.headerWidget || this.headerWidget
                f.formatter = f.formatter || this.genDefaultFormater(f)
                if (f.subColumns) {
                    f.subColumns = f.subColumns.map(i => this.normalizeItem(i))
                }
                if (f.rows) {
                    f.rows = f.rows.map(i => this.normalizeItem(i))
                }
                return f
            },
            onRowDblClick (row, column, cell, event) {
                if (this.dblClickAction) {
                    let action = this.avairableActions[this.dblClickAction]
                    if (action && (!action.show || action.show())) {
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
            fieldNames (){
                let fs = flatten(this._items, 'subColumns')
                return fs.map(a => a.name)
            },
            _value(){
                if (this.group > 0) {
                    return sortBy(this.value, this.fieldNames)
                }
                return this.value
            },
            spanMap () {
                return genSpanMap(this._value, this.fieldNames, this.group)
            },

            elListeners () {
                return {'row-dblclick': this.onRowDblClick, ...this.$listeners}
            },
            elAttrs () {
                return {'span-method': this.spanMethod, ...this.$attrs}
            }
        }
    }
</script>
