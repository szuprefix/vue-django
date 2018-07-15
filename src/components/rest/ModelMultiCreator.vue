<template>
    <div>
        <div>
            <el-button-group>
                <el-button type="plain" size="mini" icon="el-icon-edit" @click="onEdit">编辑</el-button>
                <el-button type="plain" size="mini" icon="el-icon-view" @click="onView">预览</el-button>
            </el-button-group>
            <el-radio-group v-model="splitChar" size="mini">
                <el-radio-button label="," title="字段用逗号分隔">,</el-radio-button>
                <el-radio-button :label="'\t'" title="字段用Tab符分隔">TAB</el-radio-button>
                <el-radio-button label="|" title="字段用竖线分隔">|</el-radio-button>
            </el-radio-group>
        </div>
        <el-row :gutter="40">
            <el-col :span="editZoneSpan">
                <el-input ref="content" type="textarea" :autosize="{ minRows: 24}" v-model="currentValue"
                          :placeholder="contentSample" @change="change"></el-input>
            </el-col>
            <el-col :span="viewZoneSpan">
                <div class="flex-right">
                    <el-button type="primary" @click="batchCreate">批量创建</el-button>
                </div>
                <el-table stripe border size="mini" :data="records" v-if="loaded">
                    <el-table-column :prop="f.name" :column-key="f.name" :label="f.label || f.name"
                                     :min-width="f.min_width" :width="f.width" :class-name="f.type"
                                     :type="f.type"
                                     :key="f.name" v-for="f in fieldItems"></el-table-column>
                    <el-table-column :prop="_result" label="执行结果" v-if="began">
                        <template slot-scope="{row}">

                            <el-alert
                                    :title="row._result.info"
                                    :type="row._result.status === 'success' ?  'success':'error'"
                                    v-if="row._result"
                                    show-icon>
                            </el-alert>
                        </template>
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>
    </div>
</template>
<script>
    //    import {Paper} from '../../utils/paper'
    //    import PaperView from './Paper.vue'
    import {debounce} from 'lodash'
    import model_view from '../../mixins/model_view'
    export default{
        mixins: [model_view],
        model: {
            event: "change"
        },
        props: {
            value: {
                type: String,
                default: ''
            },
            fields: Array,
            appModelName: String,
            baseValues: {
                type: Object, default: () => {
                    return {}
                }
            }
        },
        data () {
            return {
                edit: true,
                view: true,
                showAnswer: false,
                records: [],
                currentValue: null,
                splitChar: ',',
                began: false,
                queueIndex: 0
            }
        },
        components: {
//            PaperView
        },
        mounted (){
            this.currentValue = this.value
            this.modelLoadOptions().then(this.genRecords)
        },
        methods: {
            genRecords: debounce(function () {
                this.began = false
                let s = this.currentValue.trim()
                if (s.length == 0) {
                    return []
                }
                if (!this.loaded) {
                    return []
                }
                this.records = s.split('\n').map((l) => {
                    let d = {}
                    l.split(this.splitChar).forEach((v, i) => {
                        d[this.fieldItems[i].name] = v
                    })
                    return d
                })
            }, 2000),
            setCurrentValue(value) {
                if (value === this.currentValue) return
                this.currentValue = value
            },
            onEdit () {
                this.edit = true
                this.view = !this.view
            },
            onView () {
                this.view = true
                this.edit = !this.edit
            },
            onShowAnswer (){
                this.showAnswer = !this.showAnswer
            },

            handleChange(event) {
                this.$emit('change', event.target.value)
            },
            change(val){
                this.$emit('input', val)
            },
            setCurrentValue(value) {
                this.currentValue = value
            },
            batchCreate(){
                this.began = true
                this.queueIndex = 0
                this.postOne()
            },
            setResult(i, d){
                let r = this.records[i]
                r['_result'] = d
                this.$set(this.records, i, r)
            },
            postOne(){
                let qi = this.queueIndex
                if (qi < this.records.length) {
                    let a = Object.assign({}, this.baseValues, this.records[qi])
                    this.modelId = undefined
                    this.modelSave(a).then((data) => {
                        this.setResult(qi, {status: 'success', info: '成功'})
                    }).catch((error) => {
                        this.setResult(qi, {status: 'failed', info: error.msg})
//                        console.log(this.records)
                    }).then(() => {
                        this.postOne()
                    })
                } else {
                    this.modelEmitPosted()
                    console.log("batch done")
                }
                this.queueIndex += 1
            }
        },
        computed: {
            loaded(){
                return Object.keys(this.modelFieldConfigs).length > 0
            },
            editZoneSpan (){
                return this.edit ? (this.view ? 10 : 24) : 0
            },
            viewZoneSpan (){
                return this.view ? (this.edit ? 14 : 24) : 0
            },
            fieldNames(){
                if (!this.loaded) {
                    return []
                }
                return this.fieldItems.map((a) => a.label || a.name)
            },
            contentSample(){
                return this.fieldNames.join(this.splitChar)
            },
            fieldItems(){
                return this.fields.map((a) => {
                    if (typeof a == 'string') {
                        return this.modelFieldConfigs[a]
                    }
                    return a
                })
            }
        },
        watch: {
            'value'(val, oldValue) {
                this.currentValue = val
            },
            currentValue () {
                this.$emit('change', this.currentValue)
                this.genRecords()
            },
            splitChar () {
                this.genRecords()
            }
        }
    }
</script>
<style scoped>


</style>
