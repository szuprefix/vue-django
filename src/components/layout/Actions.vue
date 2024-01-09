<script setup>
    import {ref, reactive, computed, watch} from 'vue'
    import serverResponse from '../../mixins/server_response'
    import arrayNormalize from '../../utils/array_normalize'
    const props = defineProps({
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
    })

    const actionItems = ref([])
    const loadingMap = reactive({})
    const dialog = ref(undefined)

    function setLoading(name, b) {
        loadingMap[name] = b
//        loadingMap = {...loadingMap}
    }
    function getConfirm(action) {
        if (action.confirm instanceof Function) {
            return action.confirm
        } else if (action.confirm) {
            return (action) => this.$confirm(action.notice, `确定要执行"${action.label || action.title}"操作吗?`, {type: action.type || 'warning'})
        } else {
            return (action) => Promise.resolve()
        }
    }
    function handleCommand(action) {
        let confirmFunc = this.getConfirm(action)
        let context = this.context
        if (typeof context === 'function') {
            context = context()
        }
        confirmFunc(action).then(() => {
            let command = action.do
            let result
            setLoading(action.name, true)
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
                    setLoading(action.name, false)
                })
            } else {
                setLoading(action.name, false)
            }
        }).catch(this.onServerResponseError)
    }
    function normalizeItem(a) {
        if (a instanceof Array) {
            return arrayNormalize(a, props.map, normalizeItem)
        }
        if (!a.show && props.permissionFunction && a.permission) {
            a.show = () => props.permissionFunction(a.permission)
//                    console.log(a)
        }
        return a
    }
    function getIconClass(icon) {
        return icon && (icon.includes(' ') ? icon : `fa fa-${icon}`) || undefined
    }
    function normalizeItems() {
        actionItems.value = arrayNormalize(props.items, props.map, normalizeItem)
    }

    const showActions = computed(() => {
        return this.actionItems.filter((a) => {
            return !(a instanceof Array)
        })
    })

    const dropdownActions = computed(() => {
        return this.actionItems.filter((a) => {
            return (a instanceof Array)
        }).reduce((a, b) => a.concat(b), []).filter((a) => {
            return !a.show || a.show(props.context)
        })
    })
    watch(props.items, () => {
        normalizeItems()
    })

    normalizeItems()
</script>
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
                    <el-dropdown-item :command="a" v-if="!a.show || a.show(context)" :key="a.name" v-bind="a"
                                      :icon="getIconClass(a.icon)">
                        {{a.label || a.title}}
                    </el-dropdown-item>
                </template>
            </el-dropdown-menu>
        </el-dropdown>

    </el-button-group>
</template>