<template>
  <span>
    <el-button plain :icon="a.icon" v-for="a in items" @click="onCommand(a)" :title="a.notice"
               :disabled="count===0" :type="a.type"
               :key="a.name">{{a.label}}
    </el-button>
  </span>
</template>
<script>
    export default{
        props: {
            items: Array,
            context: Object,
            count: {type: Number, default: 0}
        },
        data () {
            return {}
        },
        components: {},
        methods: {
            onCommand(action){
                let rc = this.count
                if (rc == 0) {
                    this.$message('请先勾选至少一条记录')
                    return
                }
                if (action && action.do) {
                    let confirm = action.confirm === false ? () => Promise.resolve() : () => this.$confirm(action.notice, `确定要对勾选中的${rc}条记录执行"${action.label}"操作吗?`, {type: 'warning'})
                    confirm().then(() => {
                        action.do({action, ...this.context}).then(({data}) => {
                            let countInfo = data.rows >= 0 ? `${data.rows}条记录` : ''
                            this.$message({message: `操作成功${countInfo}.`, type: 'success'})
                            this.$emit("done", data)
                        })
                    }).catch(this.onServerResponseError).catch(() => {
                    })
                }
                this.$emit("command", name)
            }
        },
        computed: {}
    }
</script>
