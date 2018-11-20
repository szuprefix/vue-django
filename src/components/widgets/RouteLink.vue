<template>
  <a class="route-link" @click="$router.push(field.getLink(value,field))">{{value}}</a>
</template>
<script>
  export default{
    props: {
      value: String,
      prop: String,
      field: Object
    }
  }
</script>
