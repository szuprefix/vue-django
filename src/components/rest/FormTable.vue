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
                    <!--<el-button title="编辑" size="mini" @click="showEditForm(row)">-->
                    <!--<i :class="`fa fa-pencil`"></i>-->
                    <!--</el-button>-->
                    <el-button title="保存" size="mini" @click="saveRow(row)" v-if="readOnly == false">
                        <i :class="`fa fa-save`"></i>
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <div class="flex-right">
            <el-button title="新增" size="small" @click="showEditForm()" v-if="readOnly == false">
                <i class="fa fa-plus"></i>
            </el-button>
        </div>
        <el-dialog :visible.sync="dialogVisible">
            <r-form :formUrl="formUrl" :formItems="formTableFormItems" v-model="formValue" ref="form"
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
            dataUrl: String,
            editFields: {
                type: Array, default: function () {
                    return []
                }
            },
            createFields: {
                type: Array, default: function () {
                    return []
                }
            },
            readOnly:{
                type: Boolean, default: false
            }
        },
        mounted (){
//            console.log(this.value)
            this.modelTableInit()
            this.modelFormInit()
//            console.log(this.editFields)
        },
        data () {
            return {
                modelData: {id: 'create'},
                value: {},
                dialogVisible: false,
                formTableFormItems: []
            }
        },
        components: {FormWidget, RForm},
        methods: {
            showEditForm(row){
                if (!row) {
                    this.modelData = Object.assign({}, this.modelEmptyDataFromOptions(this.modelFieldConfigs), this.defaultCreateValue)
                    this.formTableFormItems = this.formCreateItems
                } else {
                    this.modelData = Object.assign({}, row)
                    this.formTableFormItems = this.formEditItems
                }
                this.modelId = this.modelData.id
                this.dialogVisible = true
            },
            saveRow(row){
                this.showEditForm(row)
                this.$nextTick(() => {
                    this.$refs.form.onSubmit()
                })

            },
            formTableOnFormPosted(data){
                this.dialogVisible = false
                this.modelFormOnPosted(data)
            },
            formDefaultSpan(f){
                return {xs: 24, sm: 24, md: 24, xl: 24}
            },
            formTableNormalizeItems(){
                if (this.modelTableItems.length > 0) {
                    //console.log(this.modelFormItems)
                    this.modelTableItems.forEach((i) => {
                        i.field = this.modelFormItems.find((a) => a.name === i.name)
                        i.field = this.formNormalizeItem(i.field)
                    })
                }
            }
        },
        computed: {
            formCreateItems(){
//                console.log(this.createFields)
                if (this.createFields.length == 0) {
                    return this.modelFormItems
                }
                return this.modelFormItems.filter((a) => this.createFields.includes(a.name))
            },
            formEditItems(){
//                console.log(this.editFields)
                if (this.editFields.length == 0) {
                    return [] //this.modelFormItems
                }
                return this.modelFormItems.filter((a) => this.editFields.includes(a.name))

            }
//            _modelTableItems(){
//                let its = this.modelTableItems.map((i) => {
//                    let field = this._formItems.find((a) => a.name === i.name) || {}
////                        f.widget = this.formDefaultWidget(f)
//                    return Object.assign({}, i, {field})
//                })
//                console.log(its)
//                return its
//            }
        }
        ,
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
