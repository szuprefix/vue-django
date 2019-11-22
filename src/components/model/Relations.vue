<template>
    <el-tabs type="border-card" v-if="items.length>0">
        <el-tab-pane lazy v-for="m in modelItems" :key="m.name">
            <template slot="label"><i :class="`fa fa-${m.icon}`"></i>{{m.label}}</template>
            <model-table :appModel="m.name" :baseQueries="m.baseQueries" :items="m.items" :parent="parent"></model-table>
        </el-tab-pane>
    </el-tabs>
</template>
<script>
    import Model from './Model'
    import array_normalize from '../../utils/array_normalize'
    import queue_limit from '../../utils/async_queue'
    import ModelTable from './Table.vue'
    export default{
        props: {
            parent: Object,
            items: {type: Array, default: () => []},
        },
        data () {
            return {
                modelItems: []
            }
        },
        components: {ModelTable},
        created () {
            this.normalizeItems()
        },
        methods: {
            normalizeItems () {
                this.modelItems = array_normalize(this.items, {}, (a) => {
                    let m = a.model = Model(a.name)
                    a.icon = m.config.icon
                    a.label = m.config.verbose_name
                    return a
                })
            }
        },
        watch: {
            items () {
                this.normalizeItems()
            }
        }
    }
</script>

