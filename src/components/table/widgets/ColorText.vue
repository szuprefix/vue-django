<template>
  <span :style="{'background-color':color}" class="color-text">{{value[field.name]}}
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
<style>
  .color-text {
    line-height: 200%; height: 1.3rem; display: inline-block;
  }
</style>

