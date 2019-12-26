<template>
  <span>{{value[field.name].join(delimeter)}}</span>
</template>
<script>
  export default{
    props: {
      value: Object,
      field: Object,
      delimeter: {
        type: String,
        default: ','
      }
    }
  }
</script>
