<template>
  <span :style="{color}">{{value[field.name]}}
  </span>
</template>
<script>
    export default{
        props: {
            value: Object,
            field: Object,
            context: Object
        },
        data () {
            return {}
        },
        components: {},
        methods: {},
        computed: {
            color () {
                return this.field.getColor(this.context)
            }
        }
    }
</script>

