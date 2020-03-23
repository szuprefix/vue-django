<template>
    <div>
        <template v-for="item, i in items" v-if="i<current">
            <slot v-bind="{item}"></slot>
            <el-divider v-if="i<current-1"></el-divider>
        </template>
        <el-divider v-if="current<items.length" content-position="right">
            <span style="cursor: pointer" @click="showMore">更多<i class="el-icon-arrow-down"></i> </span>
        </el-divider>
        <el-divider v-if="current> 1 && current === items.length" content-position="right">
            <span style="cursor: pointer" @click="current = 1">收起<i class="el-icon-arrow-up"></i> </span>
        </el-divider>
    </div>
</template>
<script>
    export default{
        props: {
            items: Array,
            step: {type: Number, default: 10}
        },
        data () {
            return {
                current: 1
            }
        },
        components: {},
        methods: {
            showMore () {
                this.current = Math.min(this.current + this.step, this.items.length)
            }
        },
        computed: {}
    }
</script>
