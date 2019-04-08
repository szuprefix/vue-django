<template>
    <el-menu class="el-menu-vertical-demo" router :default-active="$route.path" :collapse="false">
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
                <el-menu-item v-for="m,j in menus.items[0].items" :index="m.url" :key="m.name" v-if="!m.hidden">
                    <i :class="`fa fa-${m.icon}`"></i>{{m.name}}
                </el-menu-item>
            </template>
        </template>

    </el-menu>
</template>
<script>
    import {mapState} from 'vuex'
    import menus from '@/configs/menus'

    export default {
        computed: mapState(['user']),
        data () {
            return {menus}
        },
        methods: {
            hasPerm(p){
                if (p instanceof Array) {
                    return p.find((a) => this.hasPerm(a))
                }
                return this.permissions.indexOf(p) >= 0
            }
        }
    }
</script>
<style>
    .el-menu-item .fa {
        margin-right: 8px;
        font-size: 18px;
    }
</style>