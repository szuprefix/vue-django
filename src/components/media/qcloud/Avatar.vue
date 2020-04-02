<template>
    <el-image style="max-width:100px;" fit="fill" :src="`${url}?imageMogr2/thumbnail/360x360/quality/100`" :key="url" v-bind="[field, $attrs,$props]" lazy v-if="url"></el-image>
</template>
<script>
    export default{
        props: {
            value: Object,
            field: Object
        },
        data () {
            return {}
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
