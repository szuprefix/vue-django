<template>
    <el-button-group v-if="showActions.length>0">
        <template v-for="a in showActions">
            <el-button v-bind="[a]" :size="a.size || size" @click="handleCommand(a)"
                       v-if="!a.show || a.show(context)" :loading='loadingMap[a.name]' :key="a.name">
                <i :class="getIconClass(a.icon)" v-if="a.icon"></i>{{a.label}}
            </el-button>
        </template>
        <el-dropdown v-if="dropdownActions.length>0" @command="handleCommand" :size="size" :trigger="trigger">
          <span>
            <i class="el-icon-arrow-down el-icon--right" style="margin: 0 0.5rem;"></i>
          </span>
            <el-dropdown-menu slot="dropdown">
                <template v-for="a in dropdownActions">
                    <el-dropdown-item :command="a" v-if="!a.show || a.show(context)" :key="a.name" v-bind="[a]"
                                      :icon="getIconClass(a.icon)">
                        {{a.label || a.title}}
                    </el-dropdown-item>
                </template>
            </el-dropdown-menu>
        </el-dropdown>

    </el-button-group>
</template>
<script>
    import serverResponse from '../../mixins/server_response'
    import arrayNormalize from '../../utils/array_normalize'
    export default{
        mixins: [serverResponse],
        props: {
            items: Array,
            context: [Object, Function],
            trigger: {type: String, default: "hover"},
            map: {
                type: Object, default: () => {
                    return {}
                }
            },
            permissionFunction: Function,
            size: {type: String, default: "small"}
        },
        data () {
            return {
                actionItems: [],
                loadingMap: {},
                dialog: undefined
            }
        },
        components: {},
        created () {
            this.normalizeItems()
        },
        methods: {
            setLoading(name, b) {
                this.loadingMap[name] = b
                this.loadingMap = {...this.loadingMap}
            },
            getConfirm(action) {
                if (action.confirm instanceof Function) {
                    return action.confirm
                } else if (action.confirm) {
                    return (action) => this.$confirm(action.notice, `确定要执行"${action.label || action.title}"操作吗?`, {type: action.type || 'warning'})
                } else {
                    return (action) => Promise.resolve()
                }
            },
            handleCommand (action) {
                let confirmFunc = this.getConfirm(action)
                let context = this.context
                if (typeof context === 'function') {
                    context = context()
                }
                console.log(context)
                confirmFunc(action).then(() => {
                    let command = action.do
                    let result
                    this.setLoading(action.name, true)
                    if (typeof command === 'function') {
                        result = command(context)
                    } else {
                        result = this.$store.state.bus.$emit('opendrawer', {
                            component: command,
                            context: {...action.drawer, ...context}
                        })
                    }
                    if (result instanceof Promise) {
                        result.finally(() => {
                            this.setLoading(action.name, false)
                        })
                    } else {
                        this.setLoading(action.name, false)
                    }
                }).catch(this.onServerResponseError)
            },
            normalizeItem(a)
            {
                if (a instanceof Array) {
                    return arrayNormalize(a, this.map, this.normalizeItem)
                }
                if (!a.show && this.permissionFunction && a.permission) {
                    a.show = () => this.permissionFunction(a.permission)
//                    console.log(a)
                }
                return a
            },
            getIconClass (icon) {
                return icon && (icon.includes(' ') ? icon : `fa fa-${icon}`) || undefined
            },
            normalizeItems() {
                this.actionItems = arrayNormalize(this.items, this.map, this.normalizeItem)
            }
        },
        computed: {
            showActions () {
                return this.actionItems.filter((a) => {
                    return !(a instanceof Array)
                })
            },
            dropdownActions () {
                return this.actionItems.filter((a) => {
                    return (a instanceof Array)
                }).reduce((a, b) => a.concat(b), []).filter((a) => {
                    return !a.show || a.show(this.context)
                })
            }
        },
        watch: {
            items () {
                this.normalizeItems()
            }
        }
    }
</script>
