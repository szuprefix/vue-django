<template>
  <span>{{display}}</span>
</template>
<script>
  export default{
    props: {
      value: Object,
      prop: String,
      field: Object,
      delimeter: {
        type: String,
        default: ','
      }
    },
    computed: {
      display(){
        return this.value[this.prop].join(this.delimeter)
      }
    }
  }
</script>
