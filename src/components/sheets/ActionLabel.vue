<template>
    <el-dropdown @command="handleCommand">
        <editable-label v-model="value"></editable-label>
        <el-dropdown-menu slot="dropdown">
            <template v-for="a in actions">
                <el-dropdown-item :command="a.name" v-if="!a.show || a.show()" :key="a.name" :title="a.title"
                                  :icon="`fa fa-${a.icon}`">
                    {{a.label}}
                </el-dropdown-item>
            </template>
        </el-dropdown-menu>
    </el-dropdown>
</template>
<script>
    import EditableLabel from '../widgets/EditableLabel.vue'
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
                let action = this.actions.find(a => a.name === command)
                action.do(Object.assign({action}, this.context))
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
