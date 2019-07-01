<template>
    <el-row v-loading="loading" :element-loading-text="loading">
        <el-col :span="11">
            <csv-input v-model="_value"
                       :field="{name:'content', type:'string', items: csvItems, callback:change}"></csv-input>
        </el-col>
        <el-col :span="11" :offset="2">
            <el-button @click="batchCreate()"  type="primary" :disabled="records.length===0">开始创建</el-button>
            <data-table :fields="tableItems" v-model="records" ref="table" :group="true"
                        :options="{cellClassName}"></data-table>
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
            value: String ,
            defaults: {
                type: Object, default: a => {
                }
            }
        },
        data () {
            return {
                loading: false,
                optionsLoading: true,
                records: [],
                _value: '',
                matrix: []
            }
        },
        components: {CsvInput, DataTable},
        created () {
            this._value = this.value
            this.loadModelOptions()

        },
        methods: {
            batchCreate(defaults){
                let st = this._structure
                st.defaults = defaults || this.defaults
                this.loading = '开始批量创建'
                return queue_limit(this.matrix, 1, a => {
                    this.loading = a.join(',')
                    return st.create(a)
                }).then(data => {
                    this.loading = false
                    this.$emit('posted', {count: this.matrix.length})
                    this.$store.state.bus.$emit('model-posted', {model: st.model.config})
                    this.$message({message: `批量创建成功`, type: 'success'})
                })
            },
            change({matrix, records}){
                let st = this._structure
                let ds = st.genDataList(matrix)
                this.records = records
                this.matrix = matrix
//                console.log(JSON.stringify(matrix))
                queue_limit(matrix, 1, a => st.checkPk(a)).then(data => {
//                    console.log(st.dmap)
                    this.$refs.table.doLayout()
//                    console.log(st.getNotExists())
                })
                this.$emit('change', {matrix, records})
            },
            cellClassName({row, column, rowIndex, columnIndex}){
                let series = Object.values(row)
                let d = this._structure.get(series)
//                console.log({rowIndex,columnIndex})
//                return columnIndex < 3 ? ( d.id < 0 ? 'warning-row' : 'success-row') : ''
            },
            loadModelOptions () {
                this.optionsLoading = true
                BatchCreator.batchLoadOptions(this._structure.getModelNames()).then((r) => {
                    this.optionsLoading = false
//                    console.log(this._structure)
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
        watch: {
            _structure (val) {
                this.loadModelOptions()
            },
            defaults (dfs) {
                this._structure.defaults = dfs
            },
            value(val){
                this._value = val
            },
            _value(val){
                this.$emit('change', val)
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
