<template>
    <el-dropdown @command="handleCommand">
        <editable-label v-model="value"></editable-label>
        <el-dropdown-menu slot="dropdown">
            <template v-for="a in actions">
                <el-dropdown-item :command="a.do" v-if="!a.show || a.show()" :key="a.name" :title="a.title"
                                  :icon="`fa fa-${a.icon}`">
                    {{a.label}}
                </el-dropdown-item>
            </template>
        </el-dropdown-menu>
    </el-dropdown>
</template>
<script>
    import EditableLabel from '../../widgets/EditableLabel.vue'
    export default{
        props: {
            value: String,
            context: Object,
            actions: Array
        },
        data () {
            return {}
        },
        components: {EditableLabel},
        methods: {
            handleCommand (command) {
                command(this.context)
            },
            setValue(v){
                this.$emit('change', v)
            }
        },
        computed: {},
        watch: {
            value (newValue, oldValue){
                this.$emit('input', newValue)
                this.$emit('changed', {context: this.context, newValue, oldValue})
            }
        }
    }
</script>
<style></style>
