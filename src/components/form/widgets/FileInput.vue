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
                let f = e.target.files[0]
                this.$http.post(this.field.action, )
                this.$emit('input', f)
                console.log(f)
            }
        },
        computed: {}
    }
</script>

