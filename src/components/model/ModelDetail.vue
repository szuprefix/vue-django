<template>
    <el-form label-position="left" :data="object" class="model-detail" inline>
        <el-form-item :label="o.verbose_name" :key="n" v-for="o, n in object">
            <span>{{ o.value | display }}</span>
        </el-form-item>
    </el-form>
</template>
<script>
    import server_response from '~/mixins/server_response'
    export default{
        props: {
            url: String
        },
        mixins: [server_response],
        created (){
            this.loadData()
        },
        data () {
            return {
                object: {}
            }
        },
        components: {},
        methods: {
            loadData (){
                this.$http.get(this.url).then(({data}) => {
                    this.object = data.data.object
                    this.$emit('loaded', data.data)
                }).catch(this.onServerResponseError)
            }
        },
        filters: {
            display (val){
                return val === true ? '是' : val === false ? '否' : val
            }
        },
        computed: {}
    }
</script>
<style>
    .model-detail label {
        min-width: 120px;
        color: #99a9bf;
    }

    .model-detail .el-form-item {
        min-width: 350px;
        height: 16px;
    }
</style>