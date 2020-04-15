<template>
    <group :title="$attrs.title">
        <cell :link="c.link" v-for="c in cellItems" :key="c.name">
            <span slot="title">{{c.title}}<badge v-if="c.badge" :text="c.badge"></badge></span>
        </cell>
    </group>

</template>
<script>
    import {Cell, Group, Badge} from 'vux'
    export default{
        props: {
            items: Array
        },
        data () {
            return {
                cellItems: []
            }
        },
        mounted () {
            this.cellItems = this.items
            this.getBadges()
        },
        components: {Cell, Group, Badge},
        methods: {
            getBadges () {
                this.cellItems.forEach((a, i) => {
                    if (a.getBadge) {
                        this.$http.get(a.getBadge).then(({data}) => {
                            this.cellItems[i] = {...a, badge: data.count}
//                            console.log(this.cellItems)
                        })
                    }
                })
            }
        },
        computed: {}
    }
</script>
