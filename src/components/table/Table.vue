<template>
    <el-table :data="tableData" ref="table" v-loading="loading"
              :element-loading-text="loading" v-on="elListeners" v-bind="elAttrs">
        <slot name="left"></slot>
        <column :field="f" v-for="f in visiableItems" :key="f.name"></column>
        <el-table-column label="" align="right" fixed="right" :min-width="actionsColumnWidth"
                         v-if="actionsColumnWidth>0">
            <template slot="header" slot-scope="scope" v-if="topActions">
                <actions :items="topActionItems" :context="getTopActionContext()" :permissionFunction="$attrs.permissionFunction"
                         :map="avairableActions"></actions>
            </template>
            <template slot-scope="scope" v-if="rowActions">
                <actions :items="rowActionItems" :context="scope" :class="{'hover-show': hoverShow}" trigger="hover"
                         :map="avairableActions"></actions>
            </template>
        </el-table-column>

        <slot name="right">
        </slot>
    </el-table>
</template>
<script>
    import {percent, toThousandslsFilter, json} from '../../utils/filters'
    import {sortBy} from 'lodash'
    import Column from './Column.vue'
    import Actions from '../layout/Actions.vue'
    import {genSpanMap, flatten} from './Table'
    import arrayNormalize from '../../utils/array_normalize'
    import serverResponse from '../../mixins/server_response'
    import TrueFlag from '../widgets/TrueFlag.vue'
    import ChoicesDisplay from '../widgets/ChoicesDisplay.vue'
    import Date2Now from '../widgets/Date2Now.vue'

    export default{
        mixins: [serverResponse],
        props: {
            value: Array,
            cellWidget: [Function, Object],
            headerWidget: [Function, Object],
            topActionContext: Object,
            group: {type: Boolean, default: false},
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
                        do: this.dumpExcelData,
                        show: () => this.$store.state.tableDownload != false
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
                let dumpAllFields = this.fields.find(f => f.name==='__dump_all__')
                if(dumpAllFields){
                    let fs = Object.keys(data[0])
                    let ds = data.map(a => Object.values(a))
                    return [fs].concat(ds)
                }
                let ds = data.map((d) => {
                    let rs = []
                    this.fields.forEach(f => {
                        let fd = d[f.name]
                        if (f.items) {
                            f.items.forEach(a => {
                                rs.push(fd[a.name])
                            })
                        } else {

                            let r = d[f.name]
                            if (f.formatter) {
                                r = f.formatter(d, f.name, r)
                            }
                            rs.push(r)
                        }
                    })
                    return rs
                })
                return [this.fieldLabels].concat(ds)
            },
            excelGetAllData () {
                return Promise.resolve(this.value)
            },
            dumpExcelData(){
                this.loading = '正在导出'
                let excelGetAllData = this.$attrs.excelGetAllData || this.excelGetAllData
                let excelFormat = this.$attrs.excelFormat || this.excelFormat
                excelGetAllData().then((data) => {
                    if (data === undefined) {
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
            genDefaultFormatter (f) {
                if (f.type === 'field') {
                    return (row, column, cellValue, index) => json(cellValue, f.items)
                }
                let df = (v) => v
                let func = ['decimal', 'number', 'integer'].includes(f.type) && toThousandslsFilter || ['percent'].includes(f.type) && percent || df
                return (row, column, cellValue, index) => func(cellValue)
            },
            defaultWidget(f){
                if (f.type == 'boolean') {
                    return TrueFlag
                } else if (['datetime'].includes(f.type)) {
                    return Date2Now
                } else if (f.choices) {
                    return ChoicesDisplay
                } else if (f.child) {
                    return function (value, field) {
                        let d = value[field.name]
                        let sfs = field.child.children
                        return d.map(r => Object.keys(sfs).map(sf => r[sf]).join(',')).join('\n')
                    }
                }
            },
            normalizeActions(actions){
                return arrayNormalize(actions, this.avairableActions, (a) => {
                    if (a instanceof Array) {
                        return this.normalizeActions(a)
                    } else {
                        return a
                    }
                })
            },
            normalizeItem(f){
                if (typeof f === 'string') {
                    f = {name: f}
                }
                f.type = f.type || 'string'
                f.align = f.align || ['decimal', 'number', 'percent', 'integer'].includes(f.type) && 'right' || 'left'
                f.widget = f.widget || this.cellWidget || this.defaultWidget(f)
                f.headerWidget = f.headerWidget || this.headerWidget
                f.formatter = f.formatter || this.genDefaultFormatter(f)
                return f
            },
            normalizeSubItems(items) {
                items.forEach(f => {
                    if (f.subColumns) {
                        f.subColumns = f.subColumns.map(i => this.normalizeItem(i))
                    }
                    if (f.rows) {
                        f.rows = f.rows.map(i => {
                            let d = this.normalizeItem(i)
//                            if(templates && templates[d.name]){
//                                Object.assign(d, templates[d.name])
//                            }
                            return d
                        })
//                        console.log(f.rows)
                    }
                })
            },
            onRowDblClick (row, column, cell, event) {
                if (this.dblClickAction) {
                    let action = this.avairableActions[this.dblClickAction]
                    if (action && (!action.show || action.show())) {
                        action.do({row, column, cell, event})
                    }
                }
            },
            getTopActionContext() {
                let ctx = {tableData: this.tableData, ...this.topActionContext}
                return ctx
            }
        },
        computed: {
            topActionItems () {
                return this.normalizeActions(this.topActions)
            },
            rowActionItems () {
                return this.normalizeActions(this.rowActions)
            },
            tableItems(){
                let rs = arrayNormalize(this.items, {}, (i) => {
                    return this.normalizeItem(i, this.items)
                })
                this.normalizeSubItems(rs)
                return rs
            },
            visiableItems () {
                return this.tableItems.filter(a => a.hidden !== true && a.name !== '__dump_all__')
            },
            fields () {
                return flatten(this.tableItems, 'subColumns')
            },
            fieldNames () {
                return this.fields.map(a => a.name)
            },
            fieldLabels () {
                let rs = []
                this.fields.map(f => {
                    let ls = f.items ? f.items : [f]
                    ls.forEach(a => {
                        rs.push(a.label || a.name)
                    })
                })
                return rs
            },
            tableData(){
                if (this.group > 0) {
                    return sortBy(this.value, this.fieldNames)
                }
                return this.value
            },
            spanMap () {
                return genSpanMap(this.tableData, this.fieldNames, this.group)
            },

            elListeners () {
                return {'row-dblclick': this.onRowDblClick, ...this.$listeners}
            },
            elAttrs () {
                return {'span-method': this.spanMethod, ...this.$attrs}
            },
            hoverShow() {
                return this.$store.state.hoverShow != false
            },
            actionsColumnWidth () {
                let a = 0
                let len = (ls) => {
                    return ls.filter((a) => {
                        return !(a instanceof Array)
                    }).length
                }
                if(this.topActionItems) {
                    a = Math.max(len(this.topActionItems), a)
                }
                if(this.rowActionItems) {
                    a = Math.max(len(this.rowActionItems), a)
                }
                return a*70+10
            }
        }
    }
</script>
