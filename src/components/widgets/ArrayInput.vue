<template>
    <el-input v-model="value_" v-bind="[$attrs,$props]" clearable type="textarea" @change="onChange"></el-input>
</template>
<script>
    import {uniq} from 'lodash'
    export default{
        model: {
            event: 'change'
        },
        props: {
            value: Array,
            field: Object,
        },
        data () {
            return {
                value_: ''
            }
        },
        created(){
            this.setValue()
        },
        components: {},
        methods: {
            setValue(){
                this.value_ = this.value && this.value.join('\n') || ''
            },
            onChange(v){
                let l = this.value_.split(/[,\n;]/g).map(a => a.trim()).filter(a => a !== '')
                this.$emit('change', uniq(l))
            }
        },
        watch: {
            value(v){
                this.setValue()
            }
        }
    }
</script>
