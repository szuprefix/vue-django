<template>
  <span style="white-space: pre-wrap">{{value[field.name]}}</span>
</template>
<script>
      export default{
          props: {
              value: Object,
              field: Object
          }
      }
</script>
