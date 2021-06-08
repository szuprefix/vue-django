<template>
    <tabbar v-show="show" style="position: fixed;" v-bind="[$attrs]" v-on="$listeners">
        <tabbar-item :show-dot="t.showDot" :selected="t.link === $route.fullPath" :badge="t.badge" v-for="t in tabItems"
                     :link="t.link" :key="t.name">
            <template #icon>
                <component v-if="t.iconComponent" :is="t.iconComponent" v-bind="[t]"></component>
                <i :class="t.iconClass || `iconfont icon-${t.icon}`"></i>
            </template>
            <template #label>
                <component v-if="t.labelComponent" :is="t.labelComponent" v-bind="[t]"></component>
                <span :class="$attrs.labelClass"  v-else>{{t.label}}</span>
            </template>
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
            this.getBadges()
        },
        methods: {
            normalizeItems () {
                this.tabItems = arrayNormalize(this.items, {}, (a) => {
                    a.label = a.label || a.name
                    return a
                })
            },
            getBadges () {
                this.tabItems.forEach((a, i) => {
                    if (a.getBadge) {
                        this.$http.get(a.getBadge).then(({data}) => {
                            this.tabItems[i] = {...a, badge: data.count}
                        })
                    }
                })
            }
        },
        components: {
            Tabbar,
            TabbarItem
        },
        computed: {
            show () {
                return this.tabItems.map(a => a.link).includes(this.$route.fullPath)
            }
        },
        watch: {
            items (val) {
                this.normalizeItems()
            }
        }

    }
</script>
