<template>

    <div v-loading="loading" :element-loading-text="loading">
        <el-steps :active="step" finish-status="success"  simple>
            <el-step title="上传Excel"></el-step>
            <el-step title="整理数据"></el-step>
            <el-step title="绑定字段"></el-step>
        </el-steps>

        <el-upload :action="actionUrl" ref="uploader" v-if="step === 0"
                   :show-file-list="false" :with-credentials="true" :auto-upload="false"
                   :on-change="submitUpload">
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">只能上传excel文件，且不超过5MB</div>
        </el-upload>
        <template v-if="this.excelData && step===1">
            <!--<el-button @click="step &#45;&#45;">上一步</el-button>-->
            <el-button @click="genFieldMap(); step ++; ">下一步</el-button>
            <book v-model="this.excelData"></book>
        </template>
        <div v-if="step===2">
            <el-button @click="step --">上一步</el-button>
            <el-button @click="change(); step =0; ">确认</el-button>
            <column-bind v-model="fieldMap" :choices="bindChoices"></column-bind>
        </div>
        <!--<div v-if="step===3">-->
            <!--<el-button @click="step &#45;&#45;">上一步</el-button>-->
            <!--<el-button @click="change">确认</el-button>-->
            <!--&lt;!&ndash;<data-table v-model="importData" :fields="fields" group></data-table>&ndash;&gt;-->
        <!--</div>-->
    </div>
</template>
<script>
    import ColumnBind from '../table/ColumnBind.vue'
    import DataTable from '../table/DataTable.vue'
    import Book from './Book.vue'
    import EditableLabel from '../widgets/EditableLabel.vue'
    import {SheetUtil, ColumnUtil} from '../../utils/sheets'
    import {uniqWith, isEqual, pick, zip} from 'lodash'
    import {genValidatorFromTableItems} from "../../utils/validators";

    export default{
        props: {
            value: Object,
            binding: Object
        },
        data () {
            return {
                fieldMap: {},
                step: 0,
                excelData: null,
                importData: null
            }
        },
        components: {Book, EditableLabel, ColumnBind, DataTable},
        created () {

        },
        methods: {
            genFieldMap(){
                let d = {}
                this.binding.forEach(f => {
                    let cs = [f.name, f.label].concat(f.synonyms)
                    d[f.label] = this.fieldNames.find(n => cs.includes(n))
                })
                this.fieldMap = Object.assign(d)
            },
            genData() {
                let data = uniqWith(this.block.data, isEqual)
                this.importData = data
                this.change()
//                this.$emit('data', {data})
            },
            onUploadSuccess(res, file) {
                this.excelData = file.response
            },
            submitUpload (file, fileList){
                this.loading = '上传中'
                let formData = new FormData()
                formData.append('file', file.raw)
                formData.append('orient', 'blocks')
                let config = {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }

                this.$http.post('/common/excel/read/', formData, config).then(({data}) => {
                    this.loading = false
                    SheetUtil.normalize(data)
                    this.excelData = data
                    this.step=1
                }).catch(this.onServerResponseError)
            },
            change(){
                let pairs = []
                let d = this.fieldMap
                this.binding.forEach(f => {
                    pairs.push([d[f.label], f.name])
                })
//                console.log([pairs, this.importData])
                ColumnUtil.rename(this.block, pairs)
                let validator = genValidatorFromTableItems(this.binding)
                this.block.data.forEach(r => {
                    validator.format(r)
                    validator.validate(r)
                })
                this.$emit('input', this.block)
            }
        },
        computed: {
            block () {
                return this.excelData.sheets[0].blocks[0]
            },
            fields(){
                return this.block.fields
            },
            fieldNames() {
                return this.fields.map(f => f.name)
            },
            bindChoices() {
                return this.fields.map(f => {
                    return {value: f.name, display_name: f.label}
                })
            }
        }
    }
</script>

