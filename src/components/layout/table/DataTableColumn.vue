<template>
    <el-table-column :label="f.label" v-if="f.subColumns">
        <data-table-column :field="sf" v-for="sf in f.subColumns" :key="sf.name"></data-table-column>
    </el-table-column>

    <el-table-column :prop="f.name" :column-key="f.name" :label="f.label || f.name"
                     :min-width="f.min_width" :width="f.width" :formater="f.formater"
                     :align="f.align" :class-name="f.type" :type="f.type" :key="f.name"
                     v-else>

        <template slot="header" slot-scope="scope">
            <component :is="f.headerWidget" v-model="f.name" :field="f" :actions="f.actions" :context="f" @changed="f.headerChange"
                       v-if="f.headerWidget && typeof f.headerWidget == 'object'"></component>
            <span v-else-if="f.headerWidget && typeof f.headerWidget == 'function'"
                  v-html="f.headerWidget(row)"></span>
            <template v-else>{{f.label || f.name}}</template>
        </template>
        <template slot-scope="{row}">
            <component :is="f.widget" v-model="row[f.name]" :context="row" :field="f"
                       v-if="f.widget && typeof f.widget == 'object'"></component>
            <span v-else-if="f.widget && typeof f.widget == 'function'" v-html="f.widget(row)"></span>
            <template v-else>{{row[f.name]}}</template>
        </template>
    </el-table-column>
</template>
<script>
    export default{
        name: 'DataTableColumn',
        props: {
            field: Object
        },
        data () {
            return {}
        },
        components: {},
        methods: {},
        computed: {
            f(){
                return this.field
            }
        }
    }
</script>
<style scoped></style>
