<template>
    <el-table :data="value" ref="table">
        <el-table-column :prop="f.name" :column-key="f.name" :label="f.label || f.name"
                         :min-width="f.min_width" :width="f.width"
                         :align="['number','integer'].includes(f.type)?'right':'left'" :class-name="f.type"
                         :type="f.type" v-for="f in _tableItems"
                         :key="f.name">
            <template slot-scope="{row}">
                <component :is="f.widget" v-model="row" :prop="f.name" :field="f"
                           v-if="f.widget && typeof f.widget == 'object'"></component>
                <span v-else-if="f.widget && typeof f.widget == 'function'" v-html="f.widget(row)"></span>
                <template v-else>{{row[f.name]}}</template>
            </template>
        </el-table-column>
    </el-table>
</template>
<script>
    export default{
        props: {
            value: Array,
            defaultWidget: [Function,Object],
            tableItems: {
                type: Array, default: function () {
                    return [{name: '__str__', label: '名称'}]
                }
            },
        },
        data () {
            return {}
        },
        components: {},
        methods: {},
        computed: {
            _tableItems(){
                return this.tableItems.map((i) => {
                    let a={}
                    if (typeof i == 'string') {
                        Object.assign(a, {name: i, label: i})
                    } else {
                        Object.assign(a, i)
                    }
                    if(!a.widget){
                        a.widget = this.defaultWidget
                    }
                    return a
                })
            }
        }
    }
</script>
<style scoped></style>
