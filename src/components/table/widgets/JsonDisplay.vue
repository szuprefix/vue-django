<template>
    <el-row class="json-display">
        <template v-for="a in items">
            <el-col :xs="a.span.xs" :sm="a.span.sm" :md="a.span.md" :lg="a.span.lg" :xl="a.span.xl"
                    :key="a.name">
                <span class="label">{{a.label}}</span>
                <span> <template v-if="a.choices">
                        {{displayChoice(a.choices, a.value)}}
                    </template><a :href="a.value" target='_blank' v-if="isLink(a.value)">{{a.value}}</a> <template v-else>{{a.value}}</template>&nbsp;</span>
            </el-col>
        </template>

    </el-row>
</template>
<script>
    import arrayNormalize from '../../../utils/array_normalize'
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
                let d = this.value[this.field.name]
                let items = this.field.items || []
                this.items = arrayNormalize(items, {}, a => {
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
                console.log(this.items)
            },
            displayChoice(choices, v) {
                let b = choices.find(a => a.value === v)
                return b && b.display_name || v
            },
            isLink(a) {
                return typeof a === 'string' && (a.startsWith('http://') || a.startsWith('https://'))
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

    .json-display .label {
        width: 10rem;
        display: inline-block;
        background-color: #EBEEF5;
        text-align: right;
        padding-right: 1rem;
    }
</style>
