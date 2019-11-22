<template>
    <el-menu router :default-active="$route.path" :collapse="false" :default-openeds="defaultOpeneds" class="sidebar">
        <template v-for="mg,i in menus.items" v-if="!mg.hidden">
            <el-submenu :index="`${i}`" :key="mg.title" v-if="mg.items.length>1">
                <template slot="title">
                    <i :class="`fa fa-${mg.icon}`"></i>
                    <span>{{mg.name}}</span>
                </template>
                <el-menu-item v-for="m,j in mg.items" :index="m.url" :key="m.name" v-if="!m.hidden">
                    <i :class="`fa fa-${m.icon}`"></i>{{m.name}}
                </el-menu-item>
            </el-submenu>
            <template v-else>
                <el-menu-item v-for="m,j in mg.items" :index="m.url" :key="m.name" v-if="!m.hidden">
                    <i :class="`fa fa-${m.icon}`"></i>{{m.name}}
                </el-menu-item>
            </template>
        </template>

    </el-menu>
</template>
<script>
    import {mapState} from 'vuex'
    import menus from '@/configs/menus'
    import {reload} from '@/configs/menus'
    import {genMenusFromApps} from 'vue-django/src/configs/menus'

    export default {
        computed: mapState(['user']),
        data () {
            return {
                menus,
                defaultOpeneds: ['0']
            }
        },
        methods : {
            reload () {
                this.menu = Object.assign({}, reload(this.user.model_permissions))
                console.log(this.menu)
            }
        },
        created () {
            this.$store.state.bus.$on('get-user-info', this.reload)
        }
    }
</script>
<style>
    .sidebar .fa {
        min-width: 2rem;
        font-size: 1rem;
        text-align: center;
    }
</style>