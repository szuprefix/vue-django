<template>
    <div>
        <group v-bind="[$attrs, $props]" :title="group.title" v-for="group in groups" :key="group.title">
            <cell :title="c.name" :is-link="true" :link="getLink(c)" v-for="c, i in group.cells"
                  :key="c.id">
                <template slot="icon" v-if="$scopedSlots.icon">
                    <slot name="icon" :data="c"></slot>
                </template>
                <template v-if="$scopedSlots.title" v-slot:title="scope">
                    <slot name="title" :data="c"></slot>
                </template>
            </cell>
        </group>
    </div>
</template>
<script>
    import {template, groupBy} from 'lodash'
    import {Group, Cell} from 'vux'
    export default{
        props: {
            value: Array,
            groupBy: String
        },
        data () {
            return {
                getLink: () => ''
            }
        },
        components: {Group, Cell},
        created () {
            this.genGetLinkFunc()
        },
        methods: {
            genGetLinkFunc() {
                let l = this.$attrs.link || `/${this.$attrs.appModel.replace('.', '/')}/$\{id}`
                if (this.relationModelName) {
                    l = `${l}?relation_model_name=${this.relationModelName}`
                }
                this.getLink = template(l)
            }
        },
        computed: {
            relationModelName () {
                return this.$route.query.relation_model_name
            },
            groups () {
                if (!this.groupBy) {
                    return [{cells: this.value, title: this.$attrs.title}]
                } else {
                    let gs = []
                    let ps = this.groupBy.split(':')
                    let fieldName = ps[0]
                    let gm = groupBy(this.value, a => a[fieldName] ? a[fieldName] : '')
                    let ods = (ps.length > 1 && ps[1].split(',')) || []
                    ods = ods.concat(Object.keys(gm).filter(a => !ods.includes(a)))
                    ods.forEach(a => {
                        if (a in gm) {
                            gs.push({title: a, cells: gm[a]})
                        }
                    })
                    return gs
                }
            }
        },
        watch: {
            $route (v) {
                if (this.relationModelName) {
                    this.genGetLinkFunc()
                }
            }
        }
    }
</script>
