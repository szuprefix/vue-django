<template>
    <p class="hidden-lines" :style="{'-webkit-line-clamp': (show? null: lines)}" @click="show=!show" :title="show?'点击折叠':'点击展开全部'">{{value}}</p>
</template>
<script>
    export default{
        props: {
            lines: {type: Number, default: 4},
            value: String
        },
        data () {
            return {
                show: false
            }
        },
        components: {},
        computed: {}
    }
</script>
<style>
    .hidden-lines {
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-box-orient: vertical;
    }
</style>
