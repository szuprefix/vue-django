<template>
    <model-form :url="`${appName}/${modelName}/${id}/update/`" @loaded="setTitle" :options="{inline:true}"></model-form>
</template>
<script>
    import model_view from '../../mixins/model_view'
    export default{
        mixins: [model_view],
        created () {
            this.id = this.$route.params.id
        },
        components: {
            ModelForm: require('./ModelForm.vue')
        },
        methods: {
            setTitle(payload){
                this.tab.title = payload.title || `${this.modelVerboseName}资料修改`
            }
        }
    }
</script>
<style scoped>
</style>