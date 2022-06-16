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
              return this.value[this.field.name]
          },

      }
  }
</script>
