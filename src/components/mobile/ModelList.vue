<template>
    <list v-bind="[$attrs,$props]" v-model="data"></list>
</template>
<script>
    import List from './List.vue'
    import {Register} from '../../utils/app_model'
    export default{
        props: {
            appModel: String,
            queries: {type: Object, default: {}},
        },
        data () {
            return {
                data: [],
                model: Register.get(this.appModel)
            }
        },
        components: {List},
        created () {
            this.load()
        },
        methods: {
            load () {
                return this.model.query(this.queries).then(data => {
                    this.data = data.results
                })
            }
        },
        computed: {},
        watch: {
            queries (v) {
                this.load()
            }
        }
    }
</script>
