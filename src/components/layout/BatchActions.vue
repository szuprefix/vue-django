<template>
  <span>
    <el-button plain :icon="a.icon" v-for="a in items" @click="onCommand(a.name)"
               :disabled="count===0"
               :key="a.name">{{a.label}}
    </el-button>
  </span>
</template>
<script>
  export default{
      props:{
          items: Array,
          count: {type:Number, default: 0}
      },
    data () {
      return {}
    },
    components: {},
    methods: {
        onCommand(name){
            let rc = this.count
            if (rc == 0) {
                this.$message('请先勾选至少一条记录')
                return
            }
            let action = this.items.find((a) => a.name == name)
            if (action && action.do) {
                this.$confirm(`确定要对勾选中的${rc}条记录执行"${action.label}"操作吗?`, action.notice, {type: 'warning'}).then(() => {
                    action.do(name).then(({data}) => {
                        this.$message(`操作成功 ${data.rows}`)
                        this.$emit("done", data)
                    })
                }).catch(this.onServerResponseError)
            }
            this.$emit("command", name)
        }
    },
    computed: {}
  }
</script>
<style scoped></style>
