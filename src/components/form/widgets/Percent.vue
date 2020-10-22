<template>
    <span class="el-input-group" style="width:6rem;">
        <el-input-number v-model="number" :controls="false" style="width:6rem;"
                         @change="onChange"></el-input-number><span class="el-input-group__append">%</span>
    </span>
</template>
<script>
    import {options_without_time} from '../../../utils/date_picker_options'
    import dateUtil from 'element-ui/src/utils/date'
    export default{
        props: {
            value: String,
            field: Object
        },
        data () {
            return {
                number: this.value * 100
            }
        },
        components: {},
        created () {
            this.number = this.value * 100
        },
        methods: {
            onChange(v) {
                this.$emit('input', v / 100)
            }
        },
        watch: {
            value (v) {
                this.number = this.value * 100
            }
        }
    }
</script>
