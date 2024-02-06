<template>
    <div class="container">{{urls}}
        <el-image :src="url" :key="url" @click="$emit('pick', url)" v-for="url in urls" lazy></el-image>
    </div>
</template>
<script>
    export default{
        props: {
            value: Object,
            field: Object,
            context: Object,
        },
        data () {
            return {}
        },
        components: {},
        methods: {},
        computed: {
            urls() {
                return this.value[this.field.name]
            }
        }
    }
</script>
<style scoped="">
    .container {
        column-count: 4;
        column-gap: 0;
    }

    .item img {
        width: 100%;
    }
</style>
