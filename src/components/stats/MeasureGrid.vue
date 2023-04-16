<template>
    <el-row :gutter="10">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4" v-for="(m, i) in value" :key="i">
            <measure v-bind="[m]"></measure>
        </el-col>
    </el-row>
</template>
<script>
    import Measure from './Measure.vue'
    export default{
        props:{
            value: [Array, Object]
        },
        data () {
            return {}
        },
        components: {Measure},
        methods: {},
        computed: {
            items(){
                if(this.value instanceof Object){
                    return Object.values(this.value)
                }else{
                    return this.value
                }
            }
        }
    }
</script>

