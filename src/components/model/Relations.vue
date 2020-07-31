<template>
    <el-tabs type="border-card" v-if="modelItems.length>0">
        <el-tab-pane lazy v-for="m in modelItems" :key="m.name">
            <template slot="label"><i :class="`fa fa-${m.icon}`"></i>{{m.label}}</template>
            <model-table :appModel="m.name" :baseQueries="m.baseQueries" :items="m.items" :parent="parent"></model-table>
        </el-tab-pane>
    </el-tabs>
</template>
<script>
    import Model from './Model'
    import arrayNormalize from '../../utils/array_normalize'
    import ModelTable from './Table.vue'
    export default{
        props: {
            parent: Object,
            items: Array
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
                let items = this.items || this.parent.viewsConfig.relations || []
                this.modelItems = arrayNormalize(items, {}, (a) => {
                    let m = a.model = Model(a.name)
                    a.icon = a.icon || m.config.icon
                    a.label = a.label || m.config.verbose_name
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

