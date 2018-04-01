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
                this.valueStr = this.dict2str(this.value)

            },
            dict2str(d){
                return Object.keys(d).map((k) => `${k}:${d[k]}`).join('\n')
            },
            str2dict(s){
                let d = {}
                s.split('\n').forEach((a) => {
                    let ps = a.split(':')
                    let k = ps[0].trim()
                    if (k.length > 0) {
                        let v = ps.length > 1 && ps[1].trim() || null
                        d[k] = v
                    }
                })
                return d
            },
            onChange(v){
                this.$emit("input", this.str2dict(v))
            }
        },
        watch: {
            value(val){
                this.setValue()
            }
        }
    }
</script>
