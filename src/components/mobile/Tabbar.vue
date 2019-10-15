<template>
    <tabbar v-if="show" style="position: fixed;">
        <tabbar-item :show-dot="t.showDot" :selected="t.link === $route.path" :badge="t.badge" v-for="t in tabItems" :link="t.link" :key="t.name">
            <i slot="icon" :class="`iconfont icon-${t.icon}`"></i>
            <span slot="label">{{t.label}}</span>
        </tabbar-item>
    </tabbar>
</template>

<script>
    import {Tabbar, TabbarItem} from 'vux'
    import arrayNormalize from '../../utils/array_normalize'

    export default {
        props: {
            items: Array
        },
        data () {
            return {
                tabItems: []
            }
        },
        created () {
            this.normalizeItems()
//            console.log(this.tabItems)
        },
        methods: {
            normalizeItems () {
                this.tabItems = arrayNormalize(this.items, {}, (a) => {
                    a.label = a.label || a.name
                    return a
                })
            }
        },
        components: {
            Tabbar,
            TabbarItem
        },
        computed: {
            show () {
                return this.tabItems.map(a => a.link).includes(this.$route.path)
            }
        },
        watch: {
            items (val) {
                this.normalizeItems()
            }
        }

    }
</script>
