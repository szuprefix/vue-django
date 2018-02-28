<template>
    <div>
        <div class="actions">
            <model-search-form :options="searchOptions" @search="search"></model-search-form>
            <model-actions-form :actions="modelConfig.actions" :payload="selection"></model-actions-form>
            <!--<el-button-group class="right">-->
            <!--<el-button type="primary" icon="plus" title="新建" @click="$router.push('create')"></el-button>-->
            <!--</el-button-group>-->
        </div>
        <model-table :url="`${this.appName}/${this.modelName}/`" :queries="searchOptions.values" :routeFunc="routeFunc"
                     :itemActions="modelConfig.itemActions" @selection-change="selectionChange"
                     :hasAction="modelConfig.actions && Object.keys(modelConfig.actions).length>0" ref="table"
                     @loaded="onLoaded"></model-table>
    </div>
</template>
<script>
    import model_view from '../../mixins/model_view'
    export default{
        mixins: [model_view],
        data () {
            return {
                searchOptions: {},
                selection: []
            }
        },
        created (){
            this.tab.title = `${this.modelVerboseName}列表`
            this.$store.state.bus.$on('model-posted', this.onModelPosted)
        },
        beforeDestroy () {
            this.$store.state.bus.$off('model-posted', this.onModelPosted)
        },
        components: {
            ModelTable: require('./ModelTable.vue'),
            ModelSearchForm: require('./ModelSearchForm.vue'),
            ModelActionsForm: require('./ModelActionsForm.vue')
        },
        computed: {},
        methods: {
            onModelPosted(payload){
                if (payload.model === this.model || this.modelDependents.indexOf(payload.model) >= 0) {
                    this.$refs.table.loadData()
                }
            },
            routeFunc (row){
                return {path: `${row.id}/update/`}
            },
            search(values){
                this.$refs.table.loadData()
            },
            onLoaded (data) {
                this.searchOptions = data.data.search_form || {}
            },
            selectionChange(val){
                this.selection = val
            }
        }
    }
</script>
<style>
    /*.actions{*/
    /*display: block;*/
    /*}*/

    /*.actions {*/
    /*height:50px;*/
    /*}*/
    /*.actions .right{*/
    /*float: right;*/
    /*margin-right: 20px*/
    /*}*/
</style>