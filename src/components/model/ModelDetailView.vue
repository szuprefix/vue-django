<template>
    <model-detail :url="`${appName}/${modelName}/${id}/`" @loaded="setTitle"></model-detail>
</template>
<script>
    import model_view from '../../mixins/model_view'
    export default{
        mixins: [model_view],
        created () {
            this.id = this.$route.params.id
        },
        components: {
            ModelDetail: require('./ModelDetail.vue')
        },
        methods: {
            setTitle(payload){
                this.tab.title = payload.title || `${this.modelVerboseName}详情`
            }
        }
    }
</script>
<style scoped>
</style>