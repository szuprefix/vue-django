<template>
    <a :href="url" target="_blank" v-bind="[field]">{{url}}</a>
</template>
<script>
    export default{
        props: {
            value: String,
            prop: String,
            field: Object
        },
        computed: {
            url () {
                let l = this.value[this.field.name]
                if (l && l.startsWith('www.')) {
                    l = 'http://' + l
                }
                return l
            },

        }
    }
</script>
