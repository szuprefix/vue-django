<template>
    <el-input v-model="valueStr" :autosize="field.autosize || { minRows: 4, maxRows: 10}" type="textarea"
              @change="onChange"></el-input>
</template>
<script>
    export default{
        props: {
            value: Object,
            field: Object,
            defaultValue: [String, Object, Array]
        },
        data () {
            return {
                valueStr: ''
            }
        },
        created(){
            this.checkDefaultValue()
        },
        components: {},
        methods: {
            checkDefaultValue() {
                let v = this.value
                if (v instanceof Object) {
                    v = {...this.field.default, ...this.defaultValue, ...v}
                    if (JSON.stringify(v) != JSON.stringify(this.value)) {
                        this.$emit("input", v)
                    } else {
                        this.setValue()
                    }
                }
            },
            setValue(){
                this.valueStr = JSON.stringify(this.value, null, 4)
            },
            onChange(v){
                let jv
                try {
                    jv = JSON.parse(v)
                    this.$emit("input", jv)
                } catch(e) {
                    this.$message({type: 'error', message: 'json格式不正确'})
                }
            }
        },
        watch: {
            value(val){
                this.checkDefaultValue()
//                this.setValue()
            }
        }
    }
</script>
