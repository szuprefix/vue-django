<template>
    <div v-html="value" v-bind="[field]">
        html
    </div>
</template>
<script>
    export default{
        props: {
            value: String,
            field: Object
        },
        data () {
            return {}
        },
        components: {},
        methods: {},
        computed: {}
    }
</script>

