<template>
  <span :class="{hidden_lines:true, has_more: lines.length>1 && !show}" @dblclick="show = !show" :title="show?'双击折叠':'双击展开全部内容'">{{text}}</span>
</template>
<script>
      export default{
          props: {
              value: Object,
              field: Object
          },
          data () {
              return {
                  show: false
              }
          },
          computed : {
              text () {
                  return this.show ? this.value : this.lines[0]
              },
              lines () {
                  return this.value.split('\n')
              }
          },
          watch : {
              value (val) {
                  this.show = false
              }
          }
      }
</script>
<style>
  .hidden_lines {
    white-space: pre-wrap;
    cursor: pointer;
  }
  .hidden_lines.has_more::after{
    content: '...'
  }
</style>