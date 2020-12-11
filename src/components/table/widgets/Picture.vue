<template>
    <el-image fit='fill' v-bind="[field, $attrs, $props]" :src="`${theProxy}${value[field.name]}`"
              v-if="value[field.name]"></el-image>
</template>
<script>
    export default{
        props: {
            value: String,
            field: Object,
            context: Object,
            proxy: {type: String, default: ''}
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

