<template>
    <div id="app">
        {{$route.query}}
        <el-menu class="el-menu-demo" mode="horizontal" router>
            <el-menu-item index="/" class="brand"><img :src="logo" height="32"><b v-if="user.as_saas_worker">{{user.as_saas_worker.party}}</b>{{system_name}}</el-menu-item>
            <el-submenu index="2" style="float:right">
                <template slot="title">{{user.name}}</template>
                <el-menu-item index="/" @click="$store.dispatch('logout')">退出登录</el-menu-item>
                <el-menu-item index="/auth/change_password/">修改密码</el-menu-item>
            </el-submenu>
        </el-menu>
        <el-row :gutter="10">
            <el-col :span="4">
                <side-bar></side-bar>
            </el-col>
            <el-col :span="20">
                <view-tabs></view-tabs>
            </el-col>
        </el-row>
        <login-view></login-view>
    </div>
</template>

<script>
    import {mapState} from 'vuex'
    import SideBar from './components/layout/SideBar.vue'
    import ViewTabs from './components/layout/ViewTabs.vue'
    import LoginView from './views/auth/login.vue'
    export default {
        data () {
            return {
            }
        },
        components: {
            SideBar,
            ViewTabs,
            LoginView,
        },
        computed: mapState(['user', 'system_name', 'logo']),
        methods: {}
    }
</script>

<style>

</style>
