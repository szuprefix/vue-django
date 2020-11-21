<template>
    <span class="el-input-group" style="width:6rem;">
        <el-input-number v-model="number" :controls="false" style="width:6rem;"
                         @change="onChange"></el-input-number><span class="el-input-group__append percent-input">%</span>
    </span>
</template>
<script>
    export default{
        props: {
            value: String,
            field: Object
        },
        data () {
            return {
                number: 0
            }
        },
        components: {},
        created () {
            this.calNumber(this.value)
        },
        methods: {
            calNumber (v) {
                this.number = (v * 100).toFixed(this.fixed)
            },
            onChange(v) {
                let rv = (v / 100).toFixed(this.fixed+2)
                this.calNumber(rv)
                this.$emit('input', rv)
            }
        },
        computed: {
           fixed () {
               return this.field.fixed || 2
           }
        },
        watch: {
            value (v) {
                this.calNumber(v)
            }
        }
    }
</script>
<style>
    .el-input-group__append.percent-input{
        padding: 0 10px;
    }
</style>
