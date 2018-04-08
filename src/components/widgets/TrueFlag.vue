<template>
    <i class="el-icon-check" v-if="value[prop]"></i>
</template>
<script>
    export default{
        props: {
            value: Object,
            prop:String
        }
    }
</script>
