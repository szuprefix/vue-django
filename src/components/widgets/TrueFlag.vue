<template>
    <i class="el-icon-check" v-if="value"></i>
</template>
<script>
    export default{
        props: {
            value: Object,
            field: Object
        }
    }
</script>
