<template>
    <span>
        <el-popover ref="popover" trigger="hover">
            <div v-html="info"></div>
        </el-popover>
        <i class="el-icon-information" v-popover:popover></i>
    </span>
</template>
<script>
    export default{
        props: {
            info: String
        }
    }
</script>