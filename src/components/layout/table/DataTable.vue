<template>
    <el-table :data="value" ref="table">
        <el-table-column :prop="f.name" :column-key="f.name" :label="f.label || f.name"
                         :min-width="f.min_width" :width="f.width" :formater="f.formater"
                         :align="f.align" :class-name="f.type"
                         :type="f.type" v-for="f in _fields"
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
    import {percent, toThousandslsFilter} from '../../../utils/filters'
    export default{
        props: {
            value: Array,
            defaultWidget: [Function, Object],
            fields: {
                type: Array, default: function () {
                    return [{name: '__str__', label: '名称'}]
                }
            },
        },
        data () {
            return {}
        },
        components: {},
        methods: {
            genDefaultFormater (f) {
                let df = (v) => v
                let func = ['decimal', 'number', 'integer'].includes(f.type) && toThousandslsFilter || ['percent'].includes(f.type) && percent || df
                return (row, column, cellValue, index) => func(cellValue)
            }
        },
        computed: {
            _fields(){
                return this.fields.map((i) => {
                    let f = {}
                    if (typeof i == 'string') {
                        Object.assign(f, {name: i, label: i})
                    } else {
                        Object.assign(f, i)
                    }
                    f.type = f.type || 'string'
                    f.align = f.align || ['decimal', 'number', 'percent', 'integer'].includes(f.type) && 'right' || 'left'
                    f.widget = f.widget || this.defaultWidget
                    f.formatter = f.formatter || this.genDefaultFormater(f)
                    return f
                })
            }
        }
    }
</script>
<style scoped></style>
