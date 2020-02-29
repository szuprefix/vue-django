<template>
    <div>
        <p style="text-align: center" v-if="loading">
            <inline-loading></inline-loading>
        </p>
        <slot v-bind="{object, model}" v-if="object"></slot>
    </div>
</template>
<script>
    import {InlineLoading} from 'vux'
    import Model from 'vue-django/src/components/model/Model'
    export default{
        props: {
            id: Number,
            appModel: String
        },
        data () {
            return {
                loading: true,
                model: Model(this.appModel),
                object: undefined
            }
        },
        components: {InlineLoading},
        created () {
            this.init()
        },
        methods: {
            init () {
                this.model.id = this.id
                this.model.loadData().then(data => {
                    this.object = {...data}
                }).finally(() => {
                    this.loading = false
                })
            }
        },
        computed: {}
    }
</script>
