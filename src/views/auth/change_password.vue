<template>
    <rest-form url="/auth/user/change_password/" :fieldItems="fieldItems" :values="form"
               :options="{submitButtonText:'修改密码'}"></rest-form>
</template>
<script>
    import RestForm from '../../components/rest/Form.vue'
    export default{
        data () {
            return {
                fieldItems: [
                    {name: 'old_password', label: '原密码', required: true, widget: 'password'},
                    {name: 'new_password1', label: '新密码', required: true, widget: 'password'},
                    {
                        name: 'new_password2',
                        label: '确认密码',
                        required: true,
                        widget: 'password',
                        rules: [{validator: this.validatePass2}]
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
<style scoped></style> 