<template>
    <el-tabs type="border-card" v-if="modelItems.length>0 && !loading" v-model="index">
        <el-tab-pane lazy v-for="(m,i) in modelItems" :key="m.key || m.name" style="min-height: 10rem;">
            <template slot="label"><i :class="`fa fa-${m.icon}`"></i>{{m.label}}</template>
            <component :is="m.view" v-bind="[$props, m]" v-if="m.view"></component>
            <model-table v-else :appModel="m.name" v-bind="[$props, m]"></model-table>
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
                modelItems: [],
                index: 0,
                loading: false
            }
        },
        components: {ModelTable},
        created () {
            this.normalizeItems()
        },
        methods: {
            normalizeItems () {
                let items = this.items || this.parent.viewsConfig.relations || []
                this.modelItems = arrayNormalize(items, {}, (a, i) => {
                    let m = a.model = Model(a.name)
                    a.icon = a.icon || m.config.icon
                    a.label = a.label || m.config.verbose_name
                    return a
                })
                this.modelItems.forEach((m, i) => {
                    this.checkComponent(i)
                })
            },
            checkComponent(i) {
                let m = this.modelItems[i]
                let v = m.view
                if (!v) {
                    return null
                }
                if (typeof v == 'string') {
                    let p = `${m.name.replace('.', '/')}/${m.view}`
                    this.loading = true
                    return import('@/views/' + p + '.vue').then(module => {
                        let v = module.default
                        this.modelItems[i] = {...this.modelItems[i], view: v}
                        this.loading = false
                        return v
                    }).catch(() => {
                        console.error(`can't import ${m.name}.${m.view}`)
                    })
                } else {
                    return m.view
                }
            }
        },
        computed: {
        },
        watch: {
            index (v) {
//                this.checkComponent(v)
            },
            items () {
                this.normalizeItems()
            }
        }
    }
</script>

