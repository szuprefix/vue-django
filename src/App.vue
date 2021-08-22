<template>
    <div id="app" v-cloak :class="{mobile_mode:isMobile}">
        <template v-if="layout === 'main'">
            <component :is="view"></component>
        </template>
        <template v-else>
            <el-menu class="el-menu-demo" mode="horizontal" router>
                <el-menu-item index="/" class="brand">
                    <img :src="party.logo" height="32">
                    <b>{{party.name}}</b>
                    {{system_name}}
                </el-menu-item>
                <el-submenu index="2" style="float:right">
                    <template slot="title">{{user.name}}</template>
                    <el-menu-item index="/" @click="logout">退出登录</el-menu-item>
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
            <!--<login-view></login-view>-->
            <drawer :size="isMobile?'50%': '30%'"></drawer>
        </template>
    </div>
</template>

<script>
    import {mapState} from 'vuex'
    import SideBar from './components/layout/SideBar.vue'
    import ViewTabs from './components/layout/ViewTabs.vue'
    import Drawer from './components/layout/Drawer.vue'
    import LoginView from './views/auth/login.vue'
    export default {
        data () {
            return {
                view: null
            }
        },
        components: {
            SideBar,
            ViewTabs,
            Drawer,
            LoginView,
        },
        created(){
            this.$store.state.bus.$on("user-logout", () => {
                this.$router.replace('/auth/login/')
            })
        },
        methods: {
            logout(){
                this.$confirm("确定要退出登录吗?").then(() => {
                    this.$store.dispatch('logout')

                }).catch(this.onServerResponseError)
            },
            changeRoute(to) {
                if (to.matched.length > 0) {
                    this.view =  {...to.matched[to.matched.length - 1].components.default}
                }
            }
        },
        computed: {
            layout (){
                return this.$route.meta.layout
            },
            ...mapState(['user', 'system_name', 'party']),
            isMobile () {
                let ua = navigator.userAgent
                if (ua.match(/Android/i) || ua.match(/webOS/i) || ua.match(/iPhone/i) || ua.match(/iPad/i) || ua.match(/iPod/i) || ua.match(/BlackBerry/i) || ua.match(/Windows Phone/i)) {
                    return true
                }
                return false
            }

        },
        watch: {
            $route (newVal, oldVal) {
                this.changeRoute(newVal, oldVal)
            }

        }
    }
</script>

<style>
    [v-cloak] {
        display: none;
    }
</style>
