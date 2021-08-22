<template>
    <span>{{result}}</span>
</template>
<script>
    import {template} from 'lodash'
    export default{
        props: {
            appModel: String,
            query: String,
            measure: String
        },
        data () {
            return {
                result: null
            }
        },
        components: {},
        created () {
            this.load()
        },
        methods: {
            load () {
                let s = template(this.query)(this.$attrs)
                let url = `/${this.appModel.replace('.', '/')}/smart_stat/?${s}&measures=${this.measure}`
                return this.$http.get(url).then(({data}) => {
                    this.result = Object.values(data.data)[0]
                })
            }
        },
        computed: {}
    }
</script>
