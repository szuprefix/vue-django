<template>
    <span>
        <el-select v-model="value" :multiple="field.multiple" filterable @change="changed" remote clearable
                   :remote-method="onFilter" :class="`related-select ${field.name}`" default-first-option
                   :loading="loading" :loading-text="loading" :placeholder="field.placeholder || `请选择${field.label}`">
            <el-option :label="c.__str__ || c.name || c.title" :value="c.id || c.pk || c.url || c.name"
                       v-for="c,i in tableData" :key="c.id || c.pk || c.url || c.name"></el-option>
        </el-select>
            <i class="fa fa-plus" :title="`新增${field.label}`" @click="toCreateModel" v-if="showCreate"
               style="cursor: pointer">

            </i>
    </span>
</template>
<script>
    import model_view from '../../mixins/model_view'
    import table_view from '../../mixins/table_view'
    export default{
        mixins: [model_view, table_view],
        props: {
            placeholder: String,
            field: Object,
            showCreate: {type: Boolean, default: true},
            value: [String, Number, Array]
        },
        data () {
            return {}
        },
        created(){
            if (this.field.queries) {
                this.tableUpdateQueries(this.field.queries)
            }
            this.appModelName = this.field.model
            this.modelInit()
            this.tableUrl = this.modelListUrl
            this.tablePageSize = 2000
            this.tableLoad()
        },
        methods: {
            changed(value){
                this.$emit('input', value)
            },
            onFilter(search){
                this.tableUpdateQueries({search})
            },
            toCreateModel(row){
                let url = `${this.tableUrl}create/?${this.modelConfig.title_field}=${this.tableQueries.search}`
                console.log(url)
                this.$router.push(url)
            }
        },
        computed: {
            _placeholder(){
                let p = this.placeholder || `请选择${this.modelConfig.verboseName}`
                if (p.indexOf('请选择') == 0) {
                    return p
                } else {
                    return `请选择${p}`
                }
            }
        }
    }
</script>
<style>
    .related-select {
        width: 180px;
    }
</style>
