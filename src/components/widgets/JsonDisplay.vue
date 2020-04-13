<template>
    <el-row class="json-display">
        <template v-for="a in items">
            <el-col :span="8" class="label">{{a.label || a.name}}</el-col>
            <el-col :span="16">{{a.value}}&nbsp;</el-col>
        </template>
    </el-row>
</template>
<script>
    export default{
        props: {
            value: Object,
            field: Object,
            context: Object
        },
        data () {
            return {
                items: []
            }
        },
        created () {
            this.normalizeItems()
        },
        components: {},
        methods: {
            normalizeItems () {
                let d = this.value
                let items = this.field.items || []
                this.items = items.map(a => {
                    a.value = d[a.name]
                    return a
                })
            }
        },
        watch: {
            value () {
                this.normalizeItems()
            }
        }
    }
</script>
<style>
    .json-display {
        background-color: #F2F6FC;
    }
    .json-display .label{
        background-color: #EBEEF5;
        text-align: right; padding-right: 1rem;
    }
</style>
