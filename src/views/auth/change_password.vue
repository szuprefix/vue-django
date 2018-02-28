<template>
    <model-form url="/auth/change_password/" @form-posted="relogin"></model-form>
</template>
<script>
    export default{
        data () {
            return {}
        },
        components: {
            ModelForm: require('../../components/model/ModelForm.vue')
        },
        methods: {
            relogin(){
                this.$store.dispatch('logout')
            }
        },
        computed: {}
    }
</script>
<style scoped></style> 