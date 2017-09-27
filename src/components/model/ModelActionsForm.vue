<template>
    <el-form class="actions-form" inline v-if="actions">
        <el-form-item label-width="0px">
            <el-button-group class="right">
                <el-button type="primary" icon="plus" title="新建" @click="$router.push('create')"></el-button>
                <el-button type="primary" icon="delete" title="删除" @click="$router.push('remove')"></el-button>
                <el-button type="primary" icon="document" title="导出Excel" @click="$router.push('remove')"></el-button>
                <el-button type="primary" :disabled="payload.length === 0" @click="doAction(n, a)" :key="n"
                           v-for="a, n in actions">
                    {{a.verbose_name}}
                </el-button>
            </el-button-group>
        </el-form-item>
    </el-form>
</template>
<script>
    export default{
        props: {
            actions: {
                type: Object, default(){
                    return {}
                }
            },
            payload: {
                type: Array
            }
        },
        data () {
            return {}
        },
        components: {},
        methods: {
            doAction(action_name, action){
                let payload = this.payload
                this.$store.state.bus.$emit(action_name, {payload})
                console.log(payload)
            }
        },
        computed: {}
    }
</script>
<style>
    .actions-form {
        float: left;
    }
</style>