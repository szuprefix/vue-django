<template>
   <el-tooltip class="item" effect="dark" :content="this.raw" placement="right">
      <span style="cursor: pointer" @click="copyMobile">{{masked}}</span>
   </el-tooltip>

</template>
<script>
   import copyContentH5 from 'vue-django/src/utils/clip'
   function maskMobile(s) {
       if(!s || s.length<8) {
           return s
       }
       return s.slice(0, 3).concat('*****').concat(s.slice(8))
   }
    export default{
        props: {
            value: Object,
            field: Object,
            context: Object,
            proxy: {type:String, default: ''}
        },
        data () {
            return {}
        },
        components: {},
        methods: {
            copyMobile() {
                copyContentH5(this.raw)
                this.$message({message: `成功复制手机号${this.raw}到剪切板`, type: 'success'})
            }
        },
        computed: {
            raw () {
                return this.value[this.field.name]
            },
            masked () {
                return maskMobile(this.raw)
            }
        }
    }
</script>

