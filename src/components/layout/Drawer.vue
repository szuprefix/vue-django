<template>
    <el-drawer v-if="drawer" v-bind="[$attrs]" :title="title" :size="size" :visible.sync="drawer" @closed="drawer = undefined"
               ref="drawer">
        <component :is="drawer.component" v-bind="[drawer.context]" @done="onDialogDone"></component>
    </el-drawer>
</template>
<script>
    export default{
        data () {
            return {
                drawer: undefined,
                size: '30%',
                title: '',
                onDone: undefined
            }
        },
        components: {},
        created (){
            this.$store.state.bus.$on('opendrawer', this.onOpen)
        },
        methods: {
            onOpen (context) {
                this.drawer = undefined
                this.onDone = context.onDone
                let c = context.component
                if (typeof c === 'string') {
                    import('@/views/' + c + '.vue').then(module => {
                        this.drawer = {component: module.default, context: this.filterContext(context.context)}
                        this.size = context.context.size || '30%'
                        this.title = context.context.title || context.label
                    })
                } else {
                    this.drawer = {...context}
                }
            },
            onDialogDone (result) {
                this.drawer = undefined
                if (this.onDone) {
                    this.onDone(result)
                }
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
