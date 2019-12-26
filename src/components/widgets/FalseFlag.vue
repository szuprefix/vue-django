<template>
    <i class="el-icon-close" style="color:red;font-weight: bold" v-if="!value[field.name]"></i>
</template>
<script>
    export default{
        props: {
            value: Object,
            field: Object
        }
    }
</script>
