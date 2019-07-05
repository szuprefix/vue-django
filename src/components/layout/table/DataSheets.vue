<template>
    <el-tabs tab-position="bottom" max-height="32rem">
        <el-tab-pane lazy v-for="s,i in value.sheets" :key="i">
            <template slot="label">
                <action-label v-model="s.name" :actions="actions"></action-label>
            </template>
            <div class="data-sheet-block" v-for="b,j in s.blocks" :key="j">
                <data-block v-model="s.blocks[j]"></data-block>
            </div>
        </el-tab-pane>
    </el-tabs>
</template>
<script>
    import ActionLabel from './ActionLabel.vue'
    import DataBlock from './DataBlock.vue'
    export default{
        props: {
            value: Array
        },
        data () {
            return {
                ActionLabel,
                actions: [
                    {name: 'delete', label: '删除'},
                    {name: 'delete', label: '合并数据表'}
                ],
            }
        },
        components: { DataBlock,ActionLabel},
        methods: {
        },
        computed: {}
    }
</script>
<style>
    .data-sheet-block {
        margin-bottom: 8rem;
    }

</style>
