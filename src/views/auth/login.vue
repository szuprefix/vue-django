<template>
    <el-dialog title="登录" :visible="$store.state.user.party === undefined" :show-close="false"
               :close-on-click-modal="false">
        <rest-form  url="/auth/user/login/" :values="form" :fieldItems="fieldItems"
                   :options="{'labelWidth':'20%','submitButtonText':'登录'}" @form-posted="done"></rest-form>
    </el-dialog>

</template>
<script>
    import RestForm from '../../components/rest/Form.vue'
    export default{
        data () {
            return {
                form: {username: '', password: ''},
                fieldItems: [{name: 'username', label: '帐号'}, {name: 'password', label: '密码', widget: 'password'}]
            }
        },
        components: {
            RestForm
        },
        methods: {
            done(data){
                this.$store.dispatch("getUserInfo")
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