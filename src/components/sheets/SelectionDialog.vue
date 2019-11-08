<template>
    <el-dialog :title="value.actionName" :visible.sync="value.show">
        <el-checkbox-group v-model="value.list">
            <el-checkbox  :label="f.name" v-for="f in choices" :key="f.name" class="hide-text">
                {{f.label || f.name}}
            </el-checkbox>
        </el-checkbox-group>

        <div slot="footer" class="dialog-footer">
            <el-button @click="value.show = false">取 消</el-button>
            <el-button type="primary" @click="value.action">确定</el-button>
        </div>
    </el-dialog>
</template>
<script>
    export default{
        props: {
            value: Object,
            choices: Array
        },
        data () {
            return {}
        },
        components: {},
        methods: {},
        computed: {}
    }
</script>

