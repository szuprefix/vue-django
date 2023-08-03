<template>
    <a :href="url" target="_blank" v-bind="[field]">{{context[field.name]}}</a>
</template>
<script>
    export default{
        props: {
            value: String,
            prop: String,
            field: Object,
            context: Object
        },
        computed: {
            url () {
                let l
                if(this.field.openUrl) {
                    l = this.field.openUrl(this.context)
                }
                else {
                    l = this.value[this.field.name]
                }
                if (l && l.startsWith('www.')) {
                    l = 'http://' + l
                }
                return l
            },

        }
    }
</script>
