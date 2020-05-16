<template>
    <group :title="$attrs.title">
        <cell :link="c.link" v-for="c in cellItems" :key="c.title">
            <span slot="title">{{c.title}}<badge v-if="badges[c.title]" :text="badges[c.title]"></badge></span>
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
                cellItems: [],
                badges: {}
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
                            this.badges[a.title] = data.count
                            this.badges = {...this.badges}
                        })
                    }
                })
            }
        },
        computed: {}
    }
</script>
