<template>
    <div>
        <el-select v-model="value" :multiple="field.multiple" filterable @change="changed" remote
                   :remote-method="onFilter"
                   :loading="loading" :loading-text="loading" :placeholder="field.placeholder">
            <el-option :label="c.__str__ || c.name || c.title" :value="c.id || c.pk || c.url || c.name"
                       v-for="c,i in tableData" :key="i"></el-option>
        </el-select>
        <el-button @click="tableToCreateModel" size="mini">
            <i class="fa fa-plus" :title="`新增${field.label}`"></i>
        </el-button>
    </div>
</template>
<script>
    import model_view from '../../mixins/model_view'
    import table_view from '../../mixins/table_view'
    export default{
        mixins:[model_view, table_view],
        props: {
            placeholder: String,
            field: Object,
            value: [String, Number, Array]
        },
        data () {
            return {
            }
        },
        created(){
            this.appModelName=this.field.model
            this.modelInit()
            this.tableUrl = this.modelListUrl
            this.tableLoad()
        },
        methods: {
            changed(value){
                this.$emit('input', value)
            },
            onFilter(search){
                this.tableUpdateQueries({search})
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
<style scoped></style>
