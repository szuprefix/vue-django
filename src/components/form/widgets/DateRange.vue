<template>
    <el-date-picker
            v-model="period"
            :type="`${type}range`"
            :range-separator="defaultSeparator"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :value-format="valueFormat"
            align="right"
            :picker-options="date_picker_options">
    </el-date-picker>
</template>
<script>
    import {options_without_time} from '../../../utils/date_picker_options'
    import dateUtil from 'element-ui/src/utils/date'
    export default{
        props: {
            value: String,
            field: Object,
            separator: {type: String, default: '至'}
        },
        data () {
            return {
                date_picker_options: options_without_time,
                defaultSeparator: '至',
                period: undefined
            }
        },
        components: {},
        mounted () {
            this.setPeriod()
        },
        methods: {
            setPeriod () {
                this.period = this.value && this.value.split(this.separator)
            }
        },
        computed: {
            type () {
                return this.field.type
            },
            valueFormat () {
                return this.field && this.field.valueFormat || this.$attrs.valueFormat ||  (this.type === 'datetime' ? 'yyyy-MM-ddTHH:mm:ss' : 'yyyy-MM-dd')
            }
        },
        watch: {
            value (v) {
                this.setPeriod()
            },
            period (v) {
                let s = v && v.map(a => dateUtil.format(new Date(a), this.valueFormat)).join(this.separator) || undefined
                this.$emit('input', s)
            }
        }
    }
</script>
