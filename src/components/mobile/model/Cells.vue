<template>
    <group :title="$attrs.title">
        <cell :title="c.name" :is-link="true" :link="getLink(c)" v-for="c, i in value"
              :key="c.id">
            <template slot="icon" v-if="$scopedSlots.icon">
                <slot name="icon" :data="c"></slot>
            </template>
        </cell>
    </group>
</template>
<script>
    import {template} from 'lodash'
    import {Group, Cell} from 'vux'
    export default{
        props: {
            value: Array
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
                let l = this.$attrs.link || `/${this.$attrs.appModel.replace('.', '/')}/$\{id}/`
                if (this.relationModelName) {
                    l = `${l}?relation_model_name=${this.relationModelName}`
                }
                this.getLink = template(l)
            }
        },
        computed: {
            relationModelName () {
                return this.$route.query.relation_model_name
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
