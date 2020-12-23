<template>
    <el-image fit='fill' v-bind="[field, $attrs, $props]" :src="`${theProxy}${value[field.name]}`"
              v-if="value[field.name]" style="cursor: pointer" @click="open"></el-image>
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
        methods: {
            open () {
               window.open(this.value[this.field.name], '_blank')
            }
        },
        computed: {
            theProxy () {
                return this.proxy || this.field.proxy || ''
            }
        }
    }
</script>

