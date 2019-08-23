<template>
    <el-tabs tab-position="bottom" v-model='curSheet' :height="height" type="border-card">
        <el-tab-pane lazy v-for="s,i in value.sheets" :name="s.name" :key="i"
                     :style="`height:${height};overflow-y: scroll`">
            <template slot="label">
                <action-label v-model="s.name" :actions="actions" :context="s"></action-label>
            </template>
            <sheet v-model="value.sheets[i]"></sheet>

        </el-tab-pane>
        <selection-dialog v-model="selection" :choices="value.sheets"></selection-dialog>
    </el-tabs>
</template>
<script>
    import ActionLabel from './ActionLabel.vue'
    import select_actions from './mixins/select_action'
    import Sheet from './Sheet.vue'
    import {SheetUtil} from '../../utils/sheets'
    export default{
        mixins: [select_actions],
        props: {
            value: Array,
            height: {type: [String, Number], default: '32rem'}
        },
        data () {
            return {
                curSheet: this.value.sheets[0].name,
                actions: [
                    {name: 'drop', label: '删除数据表', do: this.toDoSelectionAction},
                    {name: 'merge', label: '合并数据表',   do: this.toDoSelectionAction}
                ],
            }
        },
        components: { ActionLabel, Sheet},
        methods: {

            drop(){
                if (this.selection.list.length === this.value.sheets.length) {
                    this.$message({message: '请至少留下一张数据表吧?'})
                    return
                }
                this.selection.show = false
                SheetUtil.drop(this.value, this.selection.list)
                this.curSheet = this.value.sheets[0].name
            },
            merge() {
                this.selection.show = false
                SheetUtil.merge(this.value, this.selection.list)
            }
        },
        computed: {}
    }
</script>
