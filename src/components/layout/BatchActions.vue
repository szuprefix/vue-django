<template>
  <span>
    <el-select v-model="scope" v-if="scopes.select.count>0 && scopes.exclude.count>0" style="width:8rem">
      <el-option :value="k" :label="v.label" v-for="v, k in scopes" :key="k"></el-option>
    </el-select>
    <el-button plain :icon="a.icon" v-for="a in items" @click="onCommand(a)" :title="a.notice"
               :disabled="scopes.select.count===0" :type="a.type"
               :key="a.name">{{a.label}}
    </el-button>
  </span>
</template>
<script>
    export default{
        props: {
            items: Array,
            context: Object,
        },
        data () {
            return {
                scope: 'select'
            }
        },
        components: {},
        methods: {
            onCommand(action){
                let scope = this.scopes[this.scope]
                if (scope.count === 0) {
                    this.$message('请先勾选至少一条记录')
                    return
                }
                if (action && action.do) {
                    let confirm = action.confirm === false ? () => Promise.resolve() : () => this.$confirm(action.notice, `确定要对${scope.label}记录执行"${action.label}"操作吗?`, {type: 'warning'})
                    confirm().then(() => {
                        action.do({action, ...this.context, scope: this.scope}).then(({data}) => {
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
        computed: {
            scopes () {
                let sc = this.context.selection.length
                let ac = this.context.count
                return {
                    select: {count: sc, label: `选中${sc}条`},
                    all: {count: ac, label: `全部${ac}条`},
                    exclude: {count: ac - sc, label: `其余${ac - sc}条`}
                }
            },
        },
        watch: {
            context(v) {
                if (v.selection.length === 0) {
                    this.scope = 'select'
                }
            }
        }
    }
</script>
