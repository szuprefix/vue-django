<template>
    <div class="login-container">
        <!--<el-dialog title="登录" :visible="!(user.id>0)" :show-close="false"-->
        <!--:close-on-click-modal="false">-->
        <rest-form formUrl="/auth/user/login/" v-model="form" :formItems="fieldItems" ref="form" formSize="big"
                   class="login-form"
                   formSubmitName="登录" formNoLabel :formHideRequiredAsterisk="true" @form-posted="done">

            <h3 slot="header">登录系统</h3>
        </rest-form>
        <!--</el-dialog>-->
    </div>
</template>
<script>
    import {mapState} from 'vuex'
    import RestForm from '../../components/rest/Form.vue'
    import {setToken} from '@/utils/auth'
    export default{
        data () {
            return {
                form: {username: '', password: ''},
                fieldItems: [
                    {
                        name: 'username', required: true, label: '帐号', span: 24, icon: 'user'
                    },
                    {
                        name: 'password',
                        required: true,
                        label: '密码',
                        widget: 'password',
                        icon: 'lock',
                        span: 24,
                        onEnter: this.submit
                    }]
            }
        },
        components: {
            RestForm
        },
        methods: {
            done(data){
                setToken(data.token.access)
                this.$store.dispatch("getUserInfo")
                this.$router.replace('/')
            },
            submit(){
                console.log('submit')
                this.$refs.form.submit()
            }
        },
        computed: mapState(['user'])
    }
</script>
<style>
    .login-container {
        position: fixed;
        height: 100%;
        width: 100%;
    }

    .login-form {
        position: absolute;
        left: 0;
        right: 0;
        width: 520px;
        padding: 35px 35px 15px 35px;
        margin: 120px auto;
    }
</style>