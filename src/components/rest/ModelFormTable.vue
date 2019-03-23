<template>
    <div>
        <div v-if="editing" header="新增" style="margin-bottom: 2rem;">
            <model-form :appModelName="appModelName" :id="modelId" v-model="modelData" :formItems="formItems"
                        ref="form" :modelDefaultValues="modelDefaultValues" formInline
                         @form-posted="editing=false"></model-form>

        </div>
        <model-table :appModelName="appModelName" :onTableDBClick="toEditModel" :tableItems="tableItems" ref="table" :topActionList="defaultActions"
                     :rowActionList="rowActionList" :tableBaseQueries="_tableBaseQueries">
            <template slot="left">
                <el-table-column type="expand">
                    <template slot-scope="{row}">
                        <model-form :appModelName="appModelName" :id="row.id" v-model="row" :formItems="formItems"
                                      :modelDefaultValues="modelDefaultValues" formInline
                                    ></model-form>

                    </template>
                </el-table-column>
            </template>
        </model-table>
    </div>
</template>
<script>
    import model_form from '../../mixins/model_form'
    import ModelForm from './ModelForm.vue'
    import ModelTable from './ModelTable.vue'
    import model_table from '../../mixins/model_table'
    export default{
        mixins: [model_table, model_form],
        props: {
            readOnly: {
                type: Boolean, default: false
            }
        },
        mounted (){
//            console.log(this.value)
            this.modelTableInit()
//            this.modelFormInit()
//            console.log(this.editFields)
        },
        data () {
            return {
                modelData: Object.assign({}, {id: 'create'}, this.tableBaseQueries),
                editing: false,
                formTableFormItems: [],
                defaultActions: ['refresh',
                    {
                        name: 'create',
                        icon: 'plus',
                        title: '创建',
                        do: this.tableToCreateModel,
                        show: () => this.modelCheckPermission('add')
                    }
                ]

            }
        },
        components: { ModelForm, ModelTable},
        methods: {
            tableToCreateModel(){
                this.modelId = 'create'
                this.modelData = Object.assign({})
                this.editing = true
//                console.log(this.modelData)
            },
            toEditModel(row, column){
                this.$refs.table.toggleRowExpansion(row)
            }

        },
        computed:{
            _tableBaseQueries(){
                return Object.assign({}, this.modelDefaultValues, this.tableBaseQueries)
            }
        }
    }
</script>
<style scoped></style>
