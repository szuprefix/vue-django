<template>
    <span>
        <el-select v-model="select_value" :disabled="field.disabled"
                   :multiple="field.multiple" filterable @change="changed" remote clearable
                   :remote-method="onFilter" :class="`related-select ${field.name}`" default-first-option
                   :loading="loading" :loading-text="loadingText"
                   :placeholder="field.placeholder || `请选择${field.label}`">
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
            value: [String, Number, Array],
            modelListSubUrl: String
        },
        created(){
            this.appModelName = this.field.model
            this.modelInit()
            this.tableUrl = this.modelListSubUrl && `${this.modelListUrl}${this.modelListSubUrl}/` || this.modelListUrl
            if (['number','string'].includes(typeof this.value) ) {
                this.tableLoad({'id': this.value}).then(() => {
                    this.tableUpdateQueries(this.field.queries)
                })
            } else if (this.value instanceof Array && this.value.length > 0) {
                let qs = {}
                qs['id__in'] = this.value.join(',')
                qs['page_size'] = this.value.length
                this.tableLoad(qs).then(() => {
                    this.tableUpdateQueries(this.field.queries)
                })
            } else {
                this.tableUpdateQueries(this.field.queries)
            }
        },
        methods: {
            changed(value){
                this.$emit('input', value)
            },
            onFilter(search){
                this.tableUpdateQueries({search})
            },
            toCreateModel(row){
                let url = `${this.tableUrl}create?${this.modelConfig.title_field}=${this.tableQueries.search}`
                this.$router.push(this.resolveRoutePath(url))
            }
        },
        data() {
            return {
                select_value: this.value
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
