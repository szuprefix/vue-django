<template>
    <el-drawer v-if="drawer" v-bind="[$attrs]" :visible.sync="drawer" @closed="onDialogDone">
        <component :is="drawer.component" v-bind="[drawer.context]" @done="onDialogDone"></component>
    </el-drawer>
</template>
<script>
    export default{
        data () {
            return {
                drawer: undefined
            }
        },
        components: {},
        created (){
            this.$store.state.bus.$on('opendrawer', this.onOpen)
        },
        methods: {
            onOpen (context) {
                this.drawer = undefined
                let c = context.component
                if(typeof c === 'string') {
                    import('@/views/'+c+'.vue').then( module => {
                        this.drawer = {component: module.default, context: this.filterContext(context.context)}
                    })
                } else{
                    this.drawer = {...context}
                }
            },
            onDialogDone () {
                this.drawer = undefined
            },
            filterContext(ctx) {
                let d = {}
                Object.keys(ctx).forEach(k => {
                    if (k.startsWith('$')) {
                        return
                    }
                    d[k] = ctx[k]
                })
                return d
            }
        },
        computed: {}
    }
</script>
