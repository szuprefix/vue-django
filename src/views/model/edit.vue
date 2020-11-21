<template>
    <model-form :appModel="appModel" v-model="data" ref="form">
        <template v-slot:bottom="{model}">
            <template v-if="model.viewsConfig">
                <el-collapse v-model="activePanels" v-if="model.viewsConfig.pannels">
                    <el-collapse-item :title="p.label" :name="i" v-for="p in model.viewsConfig.pannels"
                                      :key="p.name">
                        <component :is="p.component" :parent="model"></component>
                    </el-collapse-item>
                </el-collapse>

            </template>
            <model-relations v-if="model.data.id && model.viewsConfig"
                             :parent="model"></model-relations>

        </template>
    </model-form>
</template>
<script>
    import edit_mixin from 'vue-django/src/mixins/model/edit_mixin'
    export default{
        mixins: [edit_mixin],
        data () {
            return {
                appModel: '',
                activePanels: [0]
            }
        },
        created () {
            let ps = this.$route.path.split('/')
            this.appModel = `${ps[1]}.${ps[2]}`
        }
    }
</script>
