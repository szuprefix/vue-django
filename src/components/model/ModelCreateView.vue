<template>
    <div>
        <model-form :url="`${appName}/${modelName}/create/`" :options="{inline:true}"></model-form>
    </div>
</template>
<script>
    import model_view from '~/mixins/model_view'
    export default{
        mixins: [model_view],
        created (){
            this.tab.title = `新建${this.modelVerboseName}`
        },
        components: {
            ModelForm: require('./ModelForm.vue')
        },
        methods: {},
        computed: {}
    }
</script>
<style scoped>
</style>