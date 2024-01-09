<script setup>
    import {mapState} from 'vuex'
    import {reactive, ref} from 'vue'
    import XForm from '../../components/form/Form.vue'
    import {setToken} from '../../utils/auth'
    const AUTH_STORAGE_NAME = 'auth.username'
    import ServerResponse from '../../mixins/server_response'
    const form = reactive({username: localStorage.getItem(AUTH_STORAGE_NAME), password: ''})
    const items = ref([
        {
            name: 'username', required: true, label: '帐号', span: 24, icon: 'user', 'label-width': '0px'
        },
        {
            name: 'password',
            required: true,
            label: '密码',
            widget: 'password',
            icon: 'lock',
            span: 24,
            onChanged: submit
        }
    ])

    function done(data) {
        setToken(data.token.access)
        this.$store.dispatch('getUserInfo').then(() => {
            localStorage.setItem(AUTH_STORAGE_NAME, data.username)
            this.$router.replace(this.$route.query.redirect || '/')
        }).catch(this.onServerResponseError)
    }

    function submit() {
        this.$refs.form.onSubmit()
    }
</script>
<template>
    <div class="login-container">
        <x-form url="/auth/user/login/" v-model="form" :items="items" ref="form" size="big"
                :itemOptions="{noLabel:true}" class="login-form" submitName="登录"
                :noLabel="true" :hide-required-asterisk="true" @form-posted="done">
            <template #header><h3>登录{{$store.state.system_name}}</h3></template>
        </x-form>
    </div>
</template>
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
