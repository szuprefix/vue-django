<template>
    <el-dialog title="登录" :visible="$store.state.user.id === undefined" :show-close="false" :close-on-click-modal="false">
        <model-form url="/auth/login/" :options="{submitButtonText:'登录'}" @form-posted="done"></model-form>
    </el-dialog>

</template>
<script>
    import ModelForm from '../../components/model/ModelForm.vue'
    import {ElDialog} from 'element-ui'
    export default{
        data () {
            return {

            }
        },
        components: {
            ModelForm,
            ElDialog
        },
        methods: {
            done(data){
                this.$store.commit("setUser", data)
            }
        },
        computed: {}
    }
</script>
<style scoped>
    /*.el-button {*/
        /*margin-left: 80px;*/
    /*}*/
</style>