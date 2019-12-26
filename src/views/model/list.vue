<template>
    <div v-if="config">
        <model-grid v-if="config.mode ==='grid'" :appModel="appModel"></model-grid>
        <model-table v-else :appModel="appModel" v-model="data" ref="table"></model-table>
    </div>
</template>
<script>
    import list_mixin from 'vue-django/src/mixins/model/list_mixin'
    import Model from 'vue-django/src/components/model/Model'
    export default{
        mixins: [list_mixin],
        data () {
            return {
                appModel: '',
                config: undefined
            }
        },
        created () {
            let ps = this.$route.path.split('/')
            this.appModel = `${ps[1]}.${ps[2]}`
            let m = Model(this.appModel)
            m.loadViewsConfig().then(config => {
                this.config = config.list
            }).catch(() => {
                this.config = {}
            })
        }
    }
</script>
