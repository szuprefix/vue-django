<template>
    <i class="el-icon-check" style="color:green;font-weight: bold" :title="field.label" v-if="value[field.name]"></i>
</template>
<script>
    export default{
        props: {
            value: Object,
            field: Object
        }
    }
</script>
