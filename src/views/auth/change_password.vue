<template>
    <rest-form url="/auth/user/change_password/" :items="items" v-model="form"
               formSubmitName="修改密码"></rest-form>
</template>
<script>
    import RestForm from '../../components/form/Form.vue'
    export default{
        data () {
            return {
                items: [
                    {name: 'old_password', label: '原密码', required: true, widget: 'password', span: 24},
                    {name: 'new_password1', label: '新密码', required: true, widget: 'password', span: 24},
                    {
                        name: 'new_password2',
                        label: '确认密码',
                        required: true,
                        widget: 'password',
                        rules: [{
                            type: 'string',
                            required: true,
                            message: `不能为空`
                        },
                            {validator: this.validatePass2}], span: 24
                    }
                ],
                form: {
                    old_password: '',
                    new_password1: '',
                    new_password2: ''
                }
            }
        },
        components: {
            RestForm
        },
        methods: {
            relogin(){
                this.$store.dispatch('logout')
            },
            validatePass2  (rule, value, callback) {
                if (value !== this.form.new_password1) {
                    callback(new Error('两次输入密码不一致!'));
                } else {
                    callback();
                }
            }
        },
        computed: {}
    }
</script>
