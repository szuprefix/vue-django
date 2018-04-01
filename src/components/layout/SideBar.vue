<template>
    <el-menu class="el-menu-vertical-demo" router>
        <el-menu-item v-for="m in menus" :index="m.url" :key="m.name"><i :class="`fa fa-${m.icon}`"></i>{{m.name}}</el-menu-item>
    </el-menu>
</template>
<script>
    import {mapState} from 'vuex'
    export default {
        computed: mapState(['user', 'menus']),
        methods: {
            hasPerm(p){
                if(p instanceof Array){
                    return p.find((a) => this.hasPerm(a))
                }
                return this.permissions.indexOf(p) >= 0
            }
        }
    }
</script>
<style>
    .el-menu-item .fa{
        margin-right: 8px;
        font-size: 18px;
    }
</style>