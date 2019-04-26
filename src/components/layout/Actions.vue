<template>
    <div>
        <el-button-group v-if="showActions.length>0">
            <template v-for="a in showActions">
                <el-button :type="a.type" :title="a.title" size="small" @click="a.do" v-if="!a.show || a.show()" :key="a.name">
                    <i :class="`fa fa-${a.icon}`"></i>
                </el-button>
            </template>
        </el-button-group>
        <el-dropdown v-if="dropdownActions.length>0" @command="handleCommand" size="small" :trigger="trigger">
          <span>
            <i class="el-icon-arrow-down el-icon--right" style="margin-right: 1rem"></i>
          </span>
            <el-dropdown-menu slot="dropdown">
                <template v-for="a in dropdownActions">
                    <el-dropdown-item :command="a.do" v-if="!a.show || a.show()" :key="a.name"
                                      :icon="`fa fa-${a.icon}`">
                        {{a.title}}
                    </el-dropdown-item>
                </template>
            </el-dropdown-menu>
        </el-dropdown>
    </div>
</template>
<script>
    export default{
        props: {
            items: Array,
            trigger: {type: String, default: "hover"}
        },
        data () {
            return {}
        },
        components: {},
        methods: {
            handleCommand (command) {
                command()
            }
        },
        computed: {
            showActions () {
                return this.items.filter((a) => {
                    return !(a instanceof Array)
                })
            },
            dropdownActions () {
                return this.items.filter((a) => {
                    return (a instanceof Array)
                }).reduce((a, b) => a.concat(b), []).filter((a) => {
                    return !a.show || a.show()
                })
            }
        }
    }
</script>
<style scoped>

</style>
