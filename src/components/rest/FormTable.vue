<template>
    <div>
        <el-table :data="tableData" size="mini" v-loading="loading" :element-loading-text="loading">
            <el-table-column :prop="f.name" :column-key="f.name" :label="f.label || f.name"
                             :class-name="`${f.type} field_${f.name}`" v-for="f in modelTableItems"
                             :key="f.name" :type="f.columnType || undefined">
                <template slot-scope="{row}">
                    <component :is="f.widget" v-model="row" :prop="f.name" :field="f.field"
                               v-if="f.widget && typeof f.widget == 'object'"></component>
                    <span v-else-if="f.widget && typeof f.widget == 'function'" v-html="f.widget(row)"></span>
                    <template v-else>{{row[f.name]}}</template>
                </template>
            </el-table-column>
            <el-table-column label="">
                <template slot="header">
                    <el-button><i class="fa fa-plus"></i>产品 </el-button>
                </template>
                <template slot-scope="{row}">
                    <el-button title="编辑" size="mini" @click="showEditForm(row)">
                        <i :class="`fa fa-pencil`"></i>
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <div class="flex-right">
            <el-button title="新增" size="small" @click="showEditForm()">
                <i class="fa fa-plus"></i>
            </el-button>
        </div>
        <el-dialog :visible.sync="dialogVisible">
            <r-form :formUrl="formUrl" :formItems="modelFormItems" v-model="formValue" ref="form"
                    :formMethod="formMethod" @form-posted="formTableOnFormPosted" :formSubmit="modelFormSubmit"
                    :formTextareaSize="formTextareaSize">
            </r-form>
        </el-dialog>
    </div>
</template>
<script>
    import model_form from '../../mixins/model_form'
    import model_table from '../../mixins/model_table'
    import FormWidget from '../widgets/FormWidget.vue'
    import RForm from './Form2.vue'
    export default{
        mixins: [model_table, model_form],
        props: {
            appModelName: String,
            value: Object,
            defaultCreateValue: {
                type: Object, default: function () {
                    return {}
                }
            },
            dataUrl: String
        },
        mounted (){
//            console.log(this.value)
            this.modelTableInit()
            this.modelFormInit()
        },
        data () {
            return {
                modelData: {id: 'create'},
                value: {},
                dialogVisible: false
            }
        },
        components: {FormWidget, RForm},
        methods: {
            showEditForm(row){
                if (!row) {
                    this.modelData = Object.assign({}, this.modelEmptyDataFromOptions(this.modelFieldConfigs), this.defaultCreateValue)
                } else {
                    this.modelData = Object.assign({}, row)
                }
                this.modelId = this.modelData.id
                this.dialogVisible = true
            },
            formTableOnFormPosted(data){
                this.dialogVisible = false
                this.modelFormOnPosted(data)
            },
            formDefaultSpan(f){
                return {xs: 24, sm: 24, md: 24, xl: 24}
            },
            formTableNormalizeItems(){
                if (this.modelTableItems.length>0) {
                    this.modelTableItems.forEach((i) => {
                        i.field = this.modelFormItems.find((a) => a.name === i.name)
                    })
                }
            }
        },
        computed: {},
        watch: {
            modelFormItems(val, oldVal){
                this.formTableNormalizeItems()
            },
            modelTableItems(val, oldVal){
                this.formTableNormalizeItems()
            }
        }
    }
</script>
<style scoped></style>
