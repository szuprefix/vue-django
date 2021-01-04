<template>
    <el-row class="json-display">
        <template v-for="a in items">
            <!--<el-col :span="8" class="label">{{a.label || a.name}}</el-col>-->
            <!--<el-col :span="16">{{a.value}}&nbsp;</el-col>-->
            <el-col :xs="a.span.xs" :sm="a.span.sm" :md="a.span.md" :lg="a.span.lg" :xl="a.span.xl"
                    :key="a.name">
                <span class="label">{{a.label}}</span>
                <span>{{a.value}}&nbsp;</span>
            </el-col>
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
                    let sp = a.span
                    a.span = sp && (typeof  sp === 'number' && {xs: sp, sm: sp, md: sp, lg: sp, xl: sp} || sp) || {}
                    a.span = Object.assign({
                        xs: 24,
                        sm: 24,
                        md: 12,
                        lg: 12,
                        xl: 8
                    }, a.span)
                    return a
                })
            }
        },
        watch: {
            value () {
                this.normalizeItems()
            },
            field () {
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
        width: 10rem;
        display: inline-block;
        background-color: #EBEEF5;
        text-align: right;
        padding-right: 1rem;
    }
</style>
