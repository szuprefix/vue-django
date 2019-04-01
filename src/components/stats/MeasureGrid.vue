<template>
    <el-row>
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4" v-for="m, i in value" :key="i">
            <measure :name="m.name" :number="m.number" :icon="m.icon" :iconColor="m.iconColor"
                     :filter="m.filter"></measure>
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
<style scoped></style>
