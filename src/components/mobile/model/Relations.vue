<template>
    <div>
        <tab v-model="tab" :animate="false">
            <tab-item :active-class="`active-${i%3+1}`" :badge-label="a.badge" v-for="a, i in tabItems" :key="a.name">{{a.label}}</tab-item>
        </tab>
        <component :is="tabItems[tab].component" :owner="owner" v-bind="[tabItems[tab]]"
                   v-if="loaded"></component>
    </div>
</template>
<script>
    import {Tab, TabItem} from 'vux'
    import arrayNormalize from 'vue-django/src/utils/array_normalize'
    export default{
        model: {
            prop: 'current'
        },
        props: {
            current: Number,
            items: Array,
            owner: Object
        },
        data () {
            return {
                cache: this.$store.state.user.storage.newCache(`${this.owner.appModel}.n${this.owner.id}.relations.tab`),
                tab: undefined,
                tabItems: [],
                loaded: false
            }
        },
        components: {Tab, TabItem},
        created () {
            this.normalizeItems()
            this.tab = this.current || this.cache.read() || 0
            this.load(this.tab)
        },
        methods: {
            normalizeItems () {
                this.tabItems = arrayNormalize(this.items, {}, (a, i) => {
                    a.component = a.component || `${a.name.replace('.', '/')}/components/List`
                    if (a.getAsyncInfo) {
                        a.getAsyncInfo().then(info => {
                            this.tabItems[i] = {...this.tabItems[i], ...info}
                            this.$emit('syncinfo', info)
                        })
                    }
                    return a
                })
            },
            load (i) {
                this.loaded = false
                let a = this.tabItems[i]
                let c = a.component
                import(`@/views/${c}.vue`).then(m => {
                    this.tabItems[i] = {...a, component: m.default || {}}
                    this.loaded = true
                })
            }
        },
        computed: {},
        watch: {
            tab (v) {
                this.cache.save(v)
                if (typeof this.tabItems[v].component === 'string') {
                    this.load(v)
                }
                this.$emit('input', v)
            },
            current (v) {
                this.tab = v
            }
        }
    }
</script>
<style scoped>
    .active-1 {
        color: red !important;
        border-color: red !important;
    }

    .active-2 {
        color: #04be02 !important;
        border-color: #04be02 !important;
    }

    .active-3 {
        color: rgb(55, 174, 252) !important;
        border-color: rgb(55, 174, 252) !important;
    }
</style>
