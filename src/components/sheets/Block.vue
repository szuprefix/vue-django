<template>
    <div v-loading="loading" :element-loading-text="loading">
        <data-table v-model="value.data" :fields="normalizeFields(value.fields)" :headerWidget="ActionLabel"
                    :cellWidget="EditableLabel" :options="{elTable:{border:true,minHeight:400,stripe:true}}">

        </data-table>
        <selection-dialog v-model="selection" :choices="value.fields"></selection-dialog>
    </div>

</template>
<script>
    import DataTable from '../layout/table/DataTable.vue'
    import ActionLabel from './ActionLabel.vue'
    import EditableLabel from '../widgets/EditableLabel.vue'
    import select_actions from './mixins/select_action'
    import {set, unset, uniqueId, pick, range} from 'lodash'
    import sheets from '../../utils/sheets'
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
                    {name: 'delete', label: '删除整列', postAction: this.deleteColumn, do: this.toDoSelectionAction},
                    {name: 'merge', label: '合并字段', postAction: this.mergeColumn, do: this.toDoSelectionAction},
                    {
                        name: 'splitline2column',
                        label: '分拆内容为新列',
                        postAction: this.splitLine2Column,
                        do: this.toDoSelectionAction
                    },
                    {
                        name: 'splitline2row',
                        label: '分拆内容为新行',
                        postAction: this.splitLine2Row,
                        do: this.toDoSelectionAction
                    },
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
                sheets.renameColumn(this.value, [oldValue, newValue])
            },
            mergeColumn(){
                let fl = this.selection.list
                if (fl.length < 2) {
                    this.$message({type: 'info', message: '请选择至少两个字段'})
                    return
                }
                this.selection.show = false
                this.loading = '合并中...'
                sheets.mergeColumn(this.value, fl)
                this.loading = false
            },
            deleteColumn(){
                this.selection.show = false
                this.value.fields = this.value.fields.filter(a => !this.selection.list.includes(a.name))
            },
            splitLine2Column(){
                this.selection.show = false
                sheets.splitLine2Column(this.value, this.selection.list) 
            },
            splitLine2Row(){
                this.selection.show = false
                sheets.splitLine2Row(this.value, this.selection.list)
            }
        },
        computed: {}
    }
</script>
<style></style>
