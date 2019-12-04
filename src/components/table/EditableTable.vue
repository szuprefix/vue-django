<template>
    <x-table v-model="tableData" :items="tableItems" v-bind="$attrs" v-on="$listeners"
             :topActions="[]" :rowActions="[{name:newLine, icon:'iconfont icon-return', title:'插入一行', do:newLine}]">

        <template slot="left" v-if="$slots.left">
            <slot name="left"></slot>
        </template>
        <template slot="right" v-if="$slots.right">
            <slot name="right"></slot>
        </template>
    </x-table>
</template>
<script>
    import XTable from './Table.vue'
    import EditableLabel from '../widgets/EditableLabel.vue'
    import {range} from 'lodash'
    export default{
        props: {
            value: Array,
            items: Array,
            moreCount: {type: Number, default: 10}
        },
        data () {
            return {
                tableData: [],
                tableItems: [],
                captureKeyCode: '',
                isNewLine: false
            }
        },
        components: {XTable, EditableLabel},
        created () {
            this.normalizeItems()
            this.genTableData()
        },
        methods: {
            newLine ({$index}) {
                this.value.splice($index + 1, 0, {})
                this.isNewLine = true
                this.$emit('input', this.value)
                this.$nextTick(() => {
                    this.genTableData()
                    this.isNewLine = false
                })
            },
            normalizeItems(){
                this.tableItems = this.items.map(a => {
                    return {
                        ...a,
                        alwaysEditable: true,
                        useFormWidget: true,
                        onChanged: this.onChange,
                        widget: EditableLabel
                    }
                })
            },
            onChange ({context}) {
                let {$index} = context
                let td = this.tableData
                td = td.slice(0, Math.max($index + 1, td.length - this.moreCount))
                this.$emit('input', td)
            },
            genTableData (d) {
                this.tableData = this.value.concat(range(this.moreCount).map(a => {
                    return {}
                }))
            }
        },
        computed: {},
        watch: {
            value (v) {
                if (this.isNewLine) {
                    this.tableData = []
                } else {
                    this.genTableData()
                }
            }
        }
    }
</script>
