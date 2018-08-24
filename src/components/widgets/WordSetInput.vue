<template>
    <el-input v-model="valueStr" type="textarea" :autosize="field.autosize || {minRows: 8, maxRows: 24}" @change="onChange"></el-input>
</template>
<script>
    export default{
        props: {
            value: Array,
            field: Object
        },
        data () {
            return {
                valueStr: ''
            }
        },
        created(){
            this.setValue()
        },
        components: {},
        methods: {
            setValue(){
                this.valueStr = this.value.join("\n")

            },
            onChange(v){
                this.$emit("input", v.split("\n"))
            }
        },
        watch: {
            value(val){
                this.setValue()
            }
        }
    }
</script>
