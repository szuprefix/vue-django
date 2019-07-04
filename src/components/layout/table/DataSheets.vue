<template>
    <el-tabs tab-position="bottom" max-height="32rem">
        <el-tab-pane lazy v-for="s,i in value.sheets" :key="i">
            <template slot="label">

                <el-dropdown>
  <span class="el-dropdown-link">
    <editable-label v-model="s.name"></editable-label>
      <i class="el-icon-arrow-down el-icon--right"></i>
  </span>
                    <el-dropdown-menu slot="dropdown">
                        <template v-for="a in sheetActions">
                            <el-dropdown-item :command="a.do" v-if="!a.show || a.show()" :key="a.name" :title="a.title"
                                              :icon="`fa fa-${a.icon}`">
                                {{a.label}}
                            </el-dropdown-item>
                        </template>
                    </el-dropdown-menu>
                </el-dropdown>
            </template>
            <div class="data-sheet-block" v-for="b,j in s.blocks" :key="j">
                <data-table v-model="b.data" :fields="b.fields" :defaultWidget=""></data-table>
            </div>
        </el-tab-pane>
    </el-tabs>
</template>
<script>
    import DataTable from './DataTable.vue'
    import Actions from '../Actions.vue'
    import EditableLabel from '../../widgets/EditableLabel.vue'
    export default{
        props: {
            value: Array
        },
        data () {
            return {
                sheetActions: [
                    {name: 'delete', label: '删除'},
                    {name: 'delete', label: '合并数据块'},
                    {name: 'delete', label: '拆分行'},
                ]
            }
        },
        components: {DataTable, Actions, EditableLabel},
        methods: {},
        computed: {}
    }
</script>
<style>
    .data-sheet-block {
        margin-bottom: 8rem;
    }

</style>
