<template>
    <el-menu class="el-menu-vertical-demo" router>
        <el-menu-item index="/model/sale.case/"><i class="el-icon-date"></i>我的客户</el-menu-item>
        <el-menu-item index="/model/customer.company/" v-if="hasPerm('customer.add_company')"><i
                class="el-icon-upload"></i>客户汇总
        </el-menu-item>
        <!--<el-submenu index="2">-->
        <!--<template slot="title"><i class="el-icon-menu"></i>客户管理</template>-->
        <!--<el-menu-item index="/customer/company/create">新增公司</el-menu-item>-->
        <!--<el-menu-item index="/customer/company/">公司列表</el-menu-item>-->
        <!--</el-submenu>-->
        <!--<el-menu-item index="4"><i class="el-icon-message"></i>客服系统</el-menu-item>-->
        <!--<el-menu-item index="5"><i class="el-icon-share"></i>报表分析</el-menu-item>-->
        <!--<el-menu-item index="6"><i class="el-icon-warning"></i>质检分析</el-menu-item>-->
        <el-submenu index="/structure/" v-if="hasPerm(['company.add_department','company.add_team','company.add_worker'])">
            <template slot="title"><i class="el-icon-menu"></i>组织管理</template>

            <el-menu-item index="/model/company.worker/" v-if="hasPerm('company.add_worker')">员工</el-menu-item>
            <el-menu-item index="/model/company.team/" v-if="hasPerm('company.add_team')">组队</el-menu-item>
            <el-menu-item index="/model/company.department/" v-if="hasPerm('company.add_department')">部门</el-menu-item>
        </el-submenu>
        <el-menu-item index="/customer/options/batch_create/" v-if="hasPerm(['customer.add_level','customer.add_need'])"><i
                class="el-icon-setting"></i>系统设置
        </el-menu-item>
    </el-menu>
</template>
<script>
    import {mapState} from 'vuex'
    export default {
        computed: {
            permissions (){
                return this.user.permissions || []
            },
            ...mapState(['user'])
        },
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