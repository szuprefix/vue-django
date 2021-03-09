<template>
    <el-button-group v-if="showActions.length>0">
        <template v-for="a in showActions">
            <el-button v-bind="[a]" :size="a.size || size" @click="handleCommand(a)"
                       v-if="!a.show || a.show(context)" :key="a.name">
                <i :class="getIconClass(a.icon)" v-if="a.icon"></i>{{a.label}}
            </el-button>
        </template>
        <el-dropdown v-if="dropdownActions.length>0" @command="handleCommand" :size="size" :trigger="trigger">
          <span>
            <i class="el-icon-arrow-down el-icon--right" style="margin: 0 0.5rem;"></i>
          </span>
            <el-dropdown-menu slot="dropdown">
                <template v-for="a in dropdownActions">
                    <el-dropdown-item :command="a" v-if="!a.show || a.show(context)" :key="a.name" :title="a.title"
                                      :icon="getIconClass(a.icon)">
                        {{a.label || a.title}}
                    </el-dropdown-item>
                </template>
            </el-dropdown-menu>
        </el-dropdown>

    </el-button-group>
</template>
<script>
    import arrayNormalize from '../../utils/array_normalize'
    export default{
        props: {
            items: Array,
            context: Object,
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
                dialog: undefined
            }
        },
        components: {},
        created () {
            this.normalizeItems()
        },
        methods: {
            handleCommand (action) {
                let command = action.do
                if(typeof command === 'function') {
                    return command(this.context)
                }
                this.$store.state.bus.$emit('opendrawer', {component: command, context: {...action.drawer, ...this.context}})
            },
            normalizeItem(a)
            {
                if(a instanceof Array) {
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
//            actionItems (){
//                return this.items.map(a => {
//                    if (typeof a === 'string') {
//                        a = this.map[a]
//                    }
//                    return a
//                })
//            },
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
