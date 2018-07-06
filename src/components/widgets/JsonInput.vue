<template>
    <el-input v-model="valueStr" type="textarea" :autosize="{ minRows: 2, maxRows: 10}" @change="onChange"></el-input>
</template>
<script>
    export default{
        props: {
            value: Object
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
                this.valueStr = JSON.stringify(this.value)

            },
            onChange(v){
                this.$emit("input", JSON.parse(v))
            }
        },
        watch: {
            value(val){
                this.setValue()
            }
        }
    }
</script>
