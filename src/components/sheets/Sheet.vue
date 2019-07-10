<template>
    <el-collapse v-model="activeNames" @change="handleChange">
        <el-collapse-item :name="b.name" v-for="b,i in value.blocks" :key="i">
            <template slot="title">
                <action-label v-model="b.name" :actions="actions" :context="b"></action-label>
                <div v-if="!activeNames.includes(b.name)" class="hide-text sheet-header__columns">
                    <span v-for="f in normalizeFields(b.fields)">{{f.label}}</span>
                </div>
            </template>
            <block v-model="value.blocks[i]"></block>
        </el-collapse-item>
        <selection-dialog v-model="selection" :choices="blockSelections"></selection-dialog>
    </el-collapse>
</template>
<script>
    import ActionLabel from './ActionLabel.vue'
    import Block from './Block.vue'
    import select_actions from './mixins/select_action'
    import {BlockUtil} from '../../utils/sheets'
    export default{
        mixins: [select_actions],
        props: {
            value: Array,
        },
        data () {
            return {
                activeNames: this.value.blocks.map(b => b.name),
                actions: [
                    {name: 'drop', label: '删除', postAction: this.dropBlock, do: this.toDoSelectionAction},
                    {name: 'merge', label: '合并', postAction: this.mergeBlock, do: this.toDoSelectionAction},

                ]
            }
        },
        components: {Block, ActionLabel},
        methods: {
            normalizeFields (fields){
                fields.forEach(f => {
                    f.label = f.label || f.name
                })
                return fields
            },
            dropBlock(){
                if (this.selection.list.length === this.value.blocks.length) {
                    this.$message({message: '请至少留下一个数据块吧?'})
                    return
                }
                this.selection.show = false
                BlockUtil.drop(this.value, this.selection.list)
            },
            mergeBlock() {
                this.selection.show = false
                BlockUtil.merge(this.value, this.selection.list)
            }
        },
        computed: {
            blockSelections () {
                return this.value.blocks.map(b => {
                    return {name:b.name, label:`${b.name} : ${b.fields.map(f => f.name).join('|')}`}
                })
            }
        }
    }
</script>
<style>

    .sheet-header__columns span {
        border-left: 1px solid #888;
        padding: 0 1rem;
    }

    .sheet-header__columns span:nth-child(1) {
        border-left: 0px;
    }
</style>
