<template>
   <el-avatar :src="`${theProxy}${value[field.name]}`" v-if="value[field.name]"></el-avatar>
</template>
<script>
    export default{
        props: {
            value: String,
            field: Object,
            context: Object,
            proxy: {type:String, default: ''}
        },
        data () {
            return {}
        },
        components: {},
        methods: {},
        computed: {
            theProxy () {
                return this.proxy || this.field.proxy || ''
            }
        }
    }
</script>

