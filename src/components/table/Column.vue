<template>
    <el-table-column :label="f.label" v-if="f.subColumns">
        <table-column :field="sf" v-for="sf in f.subColumns" :key="sf.name"></table-column>
    </el-table-column>
    <el-table-column :label="f.label" v-else-if="f.rows">
        <template #default="{row,$index}">
            <div v-for="rf in f.rows" :key="rf.name">
                {{rf.label}}<widget :field="rf" :value.sync="row" :context="context(row,$index)"></widget>
            </div>
        </template>
    </el-table-column>
    <el-table-column :type="f.type" v-else-if="f.type === 'selection'"></el-table-column>
    <el-table-column :type="f.type" v-else-if="f.type === 'expand'">
        <template slot-scope="{row,$index}">
            <widget :field="f" :value.sync="row" :context="context(row,$index)"></widget>
        </template>
    </el-table-column>
    <el-table-column :prop="f.name" :column-key="f.name" :label="f.label || f.name"
                     v-bind="f" :class-name="f.type" :key="f.name"
                     v-else>

        <template #header>
            <component :is="f.headerWidget" v-model="f.name" :field="f" :actions="f.actions" :context="f"
                       @changed="f.headerChange"
                       v-if="f.headerWidget && typeof f.headerWidget == 'object'"></component>
            <span v-else-if="f.headerWidget && typeof f.headerWidget == 'function'"
                  v-html="f.headerWidget(row)"></span>
            <template v-else>{{f.label || f.name}}</template>
        </template>
        <template #default="{row,$index}">
            <el-tooltip v-if="row.$errors && row.$errors[f.name]" effect="dark"
                        :content="row.$errors[f.name].join('\n')" placement="top">

                <widget :field="f" :value.sync="row" :context="context(row,$index)" :key="f.name"
                        class="data-table-column__error">
                </widget>
                <span v-if="!row[f.name]" class="empty">&nbsp;</span>
            </el-tooltip>
            <template v-else>
                <widget :field="f" :value.sync="row" :context="context(row,$index)" :key="f.name">
                </widget>

            </template>
        </template>
    </el-table-column>
</template>
<script>
    import Widget from './Widget.vue'
    export default{
        name: 'TableColumn',
        props: {
            field: Object
        },
        data () {
            return {}
        },
        components: {Widget},
        methods: {
            context(a, $index) {
                return {...a, $index}
            }
        },
        computed: {
            f(){
                return this.field
            }
        }
    }
</script>
<style>
    .data-table-column__error {
        color: #F56C6C;
    }

    .data-table-column__error .empty {
        background-color: #FFdddd;
        display: inline-block;
        min-width: 2rem;
    }

</style>
