<template>
    <model-form :appModel="appModel" v-model="data"  ref="form">
        <template v-slot:bottom="{model}">
            <model-relations v-if="model.data.id && model.viewsConfig" :items="model.viewsConfig.relations"
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
                appModel: ''
            }
        },
        created () {
            let ps = this.$route.path.split('/')
            this.appModel = `${ps[1]}.${ps[2]}`
        }
    }
</script>
