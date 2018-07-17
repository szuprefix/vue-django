<template>
    <el-dialog title="登录" :visible="!(user.id>0)" :show-close="false"
               :close-on-click-modal="false">
        <rest-form formUrl="/auth/user/login/" v-model="form" :formItems="fieldItems"
                   formSubmitName="登录" formLabelWidth="20%" @form-posted="done"></rest-form>
    </el-dialog>

</template>
<script>
    import {mapState} from 'vuex'
    import RestForm from '../../components/rest/Form2.vue'
    export default{
        data () {
            return {
                form: {username: '', password: ''},
                fieldItems: [
                    {
                        name: 'username', required: true, label: '帐号', span: 24
                    },
                    {
                        name: 'password',
                        required: true,
                        label: '密码',
                        widget: 'password', span: 24
                    }]
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
        computed: mapState(['user'])
    }
</script>
<style scoped>
    /*.el-button {*/
    /*margin-left: 80px;*/
    /*}*/
</style>