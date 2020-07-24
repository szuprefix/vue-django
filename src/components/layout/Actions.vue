<template>
    <el-button-group v-if="showActions.length>0">
        <template v-for="a in showActions">
            <el-button :type="a.type" :title="a.title" :size="a.size || size" @click="handleCommand(a.do)"
                       v-if="!a.show || a.show()" :key="a.name">
                <i :class="getIconClass(a.icon)" v-if="a.icon"></i>{{a.label}}
            </el-button>
        </template>
        <el-dropdown v-if="dropdownActions.length>0" @command="handleCommand" :size="size" :trigger="trigger">
          <span>
            <i class="el-icon-arrow-down el-icon--right" style="margin: 0 0.5rem;"></i>
          </span>
            <el-dropdown-menu slot="dropdown">
                <template v-for="a in dropdownActions">
                    <el-dropdown-item :command="a.do" v-if="!a.show || a.show()" :key="a.name" :title="a.title"
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
                _items: []
            }
        },
        components: {},
        created () {
            this.normalizeItems()
        },
        methods: {
            handleCommand (command) {
                command(this.context)
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
                this._items = arrayNormalize(this.items, this.map, this.normalizeItem)
            },
        },
        computed: {
//            _items (){
//                return this.items.map(a => {
//                    if (typeof a === 'string') {
//                        a = this.map[a]
//                    }
//                    return a
//                })
//            },
            showActions () {
                return this._items.filter((a) => {
                    return !(a instanceof Array)
                })
            },
            dropdownActions () {
                return this._items.filter((a) => {
                    return (a instanceof Array)
                }).reduce((a, b) => a.concat(b), []).filter((a) => {
                    return !a.show || a.show()
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
