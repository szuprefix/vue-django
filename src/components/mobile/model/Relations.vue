<template>
    <div>
        <tab v-model="tab" :animate="false">
            <tab-item :active-class="`active-${i%3+1}`" v-for="a, i in items" :key="a.name">{{a.label}}</tab-item>
        </tab>
        <component :is="relationComponent" :owner="owner"
                   v-if="relationComponent"></component>
    </div>
</template>
<script>
    import {Tab, TabItem} from 'vux'
    export default{
        props: {
            items: Array,
            owner: Object
        },
        data () {
            return {
                cache: this.$store.state.user.storage.newCache(`${this.owner.appModel}.n${this.owner.id}.relations.tab`),
                tab: undefined,
                modelListComponents: [],
                relationComponent: undefined
            }
        },
        components: {Tab, TabItem},
        created () {
            this.tab = this.cache.read() || 0
            this.items.forEach((a, i) => {
                this.loadModelListComponent(i)
            })
        },
        methods: {
            loadModelListComponent (i) {
                let appModel = this.items[i].name
                import(`@/views/${appModel.replace('.', '/')}/components/List.vue`).then(m => {
                    this.modelListComponents[i] = m.default || {}
                    if (i === this.tab) {
                        this.relationComponent = this.modelListComponents[this.tab]
                    }
                })
            }
        },
        computed: {},
        watch: {
            tab (v) {
                this.relationComponent = this.modelListComponents[this.tab]
                this.cache.save(v)
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
