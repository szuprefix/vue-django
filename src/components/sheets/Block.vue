<template>
    <div v-loading="loading" :element-loading-text="loading">
        <data-table v-model="value.data" :fields="normalizeFields(value.fields)" :headerWidget="ActionLabel"
                    :cellWidget="EditableLabel" :options="{elTable:{border:true,minHeight:400,stripe:true}}">

        </data-table>
        <selection-dialog v-model="selection" :choices="value.fields"></selection-dialog>
    </div>

</template>
<script>
    import DataTable from '../table/DataTable.vue'
    import ActionLabel from './ActionLabel.vue'
    import EditableLabel from '../widgets/EditableLabel.vue'
    import select_actions from './mixins/select_action'
    import {set, unset, uniqueId, pick, range} from 'lodash'
    import {ColumnUtil} from '../../utils/sheets'
    export default{
        mixins: [select_actions],
        props: {
            value: Object
        },
        data () {
            return {
                loading: false,
                ActionLabel,
                EditableLabel,
                actions: [
                    {name: 'drop', label: '删除整列', do: this.toDoSelectionAction},
                    {name: 'merge', label: '合并字段', do: this.toDoSelectionAction},
                    {name: 'splitLine2Column', label: '分拆内容为新列', do: this.toDoSelectionAction},
                    {name: 'splitLine2Row', label: '分拆内容为新行', do: this.toDoSelectionAction},
                ]
            }
        },
        components: {DataTable, ActionLabel},
        methods: {
            normalizeFields (fields){
                fields.forEach(f => {
                    f.actions = this.actions
                    f.headerChange = this.headerChange
                })
                return fields
            },
            headerChange ({context, newValue, oldValue}){
                ColumnUtil.rename(this.value, [[oldValue, newValue.trim()]])
            },
            merge(){
                let fl = this.selection.list
                if (fl.length < 2) {
                    this.$message({type: 'info', message: '请选择至少两个字段'})
                    return
                }
                this.selection.show = false
                this.loading = '合并中...'
                ColumnUtil.merge(this.value, fl)
                this.loading = false
            },
            drop(){
                this.selection.show = false
                ColumnUtil.drop(this.value, this.selection.list)
            },
            splitLine2Column(){
                this.selection.show = false
                ColumnUtil.splitLine2Column(this.value, this.selection.list)
            },
            splitLine2Row(){
                this.selection.show = false
                ColumnUtil.splitLine2Row(this.value, this.selection.list)
            }
        },
        computed: {}
    }
</script>
