<template>
    <div v-html="value[field.name]">
        html
    </div>
</template>
<script>
    export default{
        props: {
            value: String,
            field: Object,
            context: Object
        },
        data () {
            return {}
        },
        components: {},
        methods: {},
        computed: {}
    }
</script>

