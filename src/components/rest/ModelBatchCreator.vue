<template>
    <el-row>
        <el-col :span="11">
            <csv-input v-model="value"
                       :field="{name:'content', type:'string', items: csvItems, callback:change}"></csv-input>
        </el-col>
        <el-col :span="11" :offset="2">
            <data-table :fields="tableItems" v-model="records" :group="true" :options="{cellClassName}"></data-table>
        </el-col>
    </el-row>
</template>
<script>
    import BatchCreator from '../../utils/batch_creator'
    import CsvInput from '../widgets/CsvInput.vue'
    import DataTable from '../layout/table/DataTable.vue'
    import queue_limit from '../../utils/async_queue'
    export default{
        props: {
            structure: Object,
            defaults: {
                type: Object, default: a => {
                }
            }
        },
        data () {
            return {
                optionsLoading: true,
                value: '',
                records: [],
                matrix: []
            }
        },
        components: {CsvInput, DataTable},
        created () {

            this.loadModelOptions()

//
//            let struct = {models:BatchCreator.getModels(this.structure)}
//            BatchCreator.batchLoadOptions(struct.models).then((r)=> {
//                struct.fields = this.fields = BatchCreator.getFields(this.structure)
//
////                console.log(BatchCreator.groupByModel(this.fields))
//                this.$emit('struct', struct)
////                console.log(JSON.stringify(this.fields))
//            })
        },
        methods: {
            batchCreate(){
                let st = this._structure
                queue_limit(this.matrix, 1, a => st.create(a)).then(data => {
                    console.log(st.getNotExists())
                })
            },
            change({matrix, records}){
                let st = this._structure
                let ds = st.genDataList(matrix)
                this.records = records
                this.matrix = matrix
                console.log(JSON.stringify(matrix))
                queue_limit(matrix, 1, a => st.checkPk(a)).then(data => {
//                    console.log(st.dmap)
                    console.log(st.foreignKeys[0].getNotExists())
                })
                this.$emit('change', {matrix, records})
            },
            cellClassName({row, column, rowIndex, columnIndex}){
                let series = Object.values(row)
                let d = this._structure.get(series)
                return columnIndex < 3 ? ( d.id < 0 ? 'warning-row' : 'success-row') : ''
            },
            loadModelOptions () {
                this.optionsLoading = true
                BatchCreator.batchLoadOptions(this._structure.getModelNames()).then((r) => {
                    this.optionsLoading = false
                    this.$emit('struct', this._structure)
                })
            }
        },
        computed: {
            _structure () {
                return BatchCreator.getStructure(this.structure)
            },
            tableItems  () {
                if (this.optionsLoading) {
                    return []
                }
                return this._structure.getTableItems()
            },
            csvItems () {
                return BatchCreator.genCsvItems(this.tableItems)
            }
        },
        watched: {
            _structure (val) {
                this.loadModelOptions()
            }
        }
    }
</script>
<style>
    .el-table .warning-row {
        background: lightyellow;
    }

    .el-table .success-row {
        background: lightgreen;
    }
</style>
