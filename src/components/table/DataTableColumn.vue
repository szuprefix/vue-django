<template>
    <el-table-column :label="f.label" v-if="f.subColumns">
        <data-table-column :field="sf" v-for="sf in f.subColumns" :key="sf.name"></data-table-column>
    </el-table-column>

    <el-table-column :prop="f.name" :column-key="f.name" :label="f.label || f.name"
                     :min-width="f.min_width" :width="f.width" :formater="f.formater"
                     :align="f.align" :class-name="f.type" :type="f.type" :key="f.name"
                     v-else>

        <template slot="header" slot-scope="scope">
            <component :is="f.headerWidget" v-model="f.name" :field="f" :actions="f.actions" :context="f"
                       @changed="f.headerChange"
                       v-if="f.headerWidget && typeof f.headerWidget == 'object'"></component>
            <span v-else-if="f.headerWidget && typeof f.headerWidget == 'function'"
                  v-html="f.headerWidget(row)"></span>
            <template v-else>{{f.label || f.name}}</template>
        </template>
        <template slot-scope="{row,$index}">
            <el-tooltip v-if="row.$errors && row.$errors[f.name]" effect="dark"
                        :content="row.$errors[f.name].join('\n')" placement="top">
                <div class="data-table-column__error">
                    <form-widget v-if="f.useFormWidget" :value="row" :field="f" :context="row"
                                 @change="onCellValueChange"></form-widget>
                    <component :is="f.widget" v-model="row[f.name]" :context="context(row, $index)" :field="f"
                               v-else-if="f.widget && typeof f.widget == 'object'"></component>
                    <span v-else-if="f.widget && typeof f.widget == 'function'" v-html="f.widget(row)"></span>
                    <template v-else>{{row[f.name]}}</template>
                    <span v-if="!row[f.name]" class="empty">&nbsp;</span>
                </div>
            </el-tooltip>
            <template v-else>
                <form-widget v-if="f.useFormWidget" :value="row" :field="f" :context="row"
                             @change="onCellValueChange"></form-widget>
                <component :is="f.widget" v-model="row[f.name]" :context="context(row, $index)" :field="f"
                           v-else-if="f.widget && typeof f.widget == 'object'"></component>
                <span v-else-if="f.widget && typeof f.widget == 'function'" v-html="f.widget(row)"></span>
                <template v-else>{{row[f.name]}}</template>

            </template>
        </template>
    </el-table-column>
</template>
<script>
    import FormWidget from '../widgets/FormWidget.vue'
    export default{
        name: 'DataTableColumn',
        props: {
            field: Object
        },
        data () {
            return {}
        },
        components: {FormWidget},
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
