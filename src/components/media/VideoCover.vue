<template>
    <el-image v-bind="[$attrs,$props,field]" :src="url">
    </el-image>
</template>
<script>
    export default{
        props: {
            value: String,
            field: Object
        },
        data () {
            return {}
        },
        created () {
//            console.log(this.value)
        },
        components: {},
        methods: {},
        computed: {
            url () {
                return this.value[this.field.name]
            }
        }
    }
</script>
