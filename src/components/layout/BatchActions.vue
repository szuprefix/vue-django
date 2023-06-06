<template>
  <span>
    <el-select v-model="scope" v-if="scopes.select.count>0 && scopes.exclude.count>0" style="width:8rem">
      <el-option :value="k" :label="v.label" v-for="(v, k) in scopes" :key="k"></el-option>
    </el-select>
    <el-button plain :icon="a.icon" v-for="a in items" @click="onCommand(a)" :title="a.notice"
               :disabled="scopes.select.count===0" :type="a.type"
               :key="a.name">{{a.label}}
    </el-button>
    <el-dialog :title="dialog.title" v-if="dialog" :visible.sync="showDialog">
        <!--<component :is="dialog.component" v-bind="[dialog]" :submit="runCommand(dialog.action)"></component>-->
    </el-dialog>
  </span>
</template>
<script>
    import serverResponse from '../../mixins/server_response'
    export default{
        mixins: [serverResponse],
        props: {
            items: Array,
            context: Object,
        },
        data () {
            return {
                scope: 'select',
                dialog: undefined,
                showDialog: false
            }
        },
        components: {},
        methods: {
            onCommand(action){
                if (action.dialog) {
                    this.dialog = {title: action.label, ...action.dialog, action}
                    this.showDialog = true
                } else {
                    this.runCommand(action)
                }

            },
            getConfirm(action) {
                let cfm = action.confirm
                if (typeof cfm === 'string') {
                    return (action, scope) => {
                        return new Promise((resolve, reject) => {
                            this.$store.state.bus.$emit('opendrawer', {
                                component: cfm,
                                context: {...action.drawer, ...this.context},
                                onDone: (result) => {
                                    resolve(result)
                                }
                            })
                        })
                    }
                } else if (cfm instanceof Function) {
                    return cfm
                } else if (cfm === false) {
                    return (action, scope) => Promise.resolve()
                } else {
                    return (action, scope) => this.$confirm(action.notice, `确定要对${scope.label}记录执行"${action.label}"操作吗?`, {type: 'warning'})
                }
            },
            runCommand(action) {
                let scope = this.scopes[this.scope]
                if (scope.count === 0) {
                    this.$message('请先勾选至少一条记录')
                    return
                }
                if (action && action.do) {
                    let confirmFunc = this.getConfirm(action)
                    confirmFunc(action, scope).then((confirmResult) => {
                        console.log(confirmResult)
                        if (typeof action.do === 'function') {
                            return action.do({
                                action, ...this.context,
                                scope: this.scope,
                                confirmResult
                            }).then(({data}) => {
                                let countInfo = data.rows >= 0 ? `${data.rows}条记录` : ''
                                this.$message({message: `操作成功${countInfo}.`, type: 'success'})
                                this.$emit("done", data)
                            })
                        }
                        this.$store.state.bus.$emit('opendrawer', {
                            component: action.do,
                            context: {...action.drawer, ...this.context, scope: this.scopes[this.scope]}
                        })

                    }).catch(this.onServerResponseError)
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
            }
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
