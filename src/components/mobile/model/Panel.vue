<template>
    <panel v-bind="[$attrs]" :list="list" v-if="list.length>0"></panel>
</template>
<script>
    import {Panel} from 'vux'
    export default{
        props: {
            items: {type: Array, default: []},
            value: {type: Array, default: []}
        },
        data () {
            return {
                list: []
            }
        },
        components: {Panel},
        methods: {
            normailizeList () {
                let ls = []
                this.value.map((a) => {
                    let d = {meta: {}}
                    this.items.forEach((f) => {
                        let p = f.placeholder || 'meta'
                        let v = (f.name === '$' && a) || a[f.name]
                        if (f.format) {
                            v = f.format(v)
                        }
                        if (['source', 'date', 'other'].includes(p)) {
                            d['meta'][p] = v
                        } else {
                            d[p] = v
                        }
                    })
                    ls.push(d)
                })
                this.list = ls
//                console.log(this.list)
            }
        },
        created () {
            this.normailizeList()
        },
        computed: {},
        watch: {
            value (v) {
                this.normailizeList()
            }
        }
    }
</script>
