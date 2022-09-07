<template>
    <input type="file" v-bind="[field]" @change="onChange"/>
</template>
<script>
    export default{
        props: {
            value: Object,
            field: Object
        },
        data () {
            return {}
        },
        components: {},
        methods: {
            onChange(e) {
                this.$emit('input', e.target.files[0])
            }
        },
        computed: {}
    }
</script>

