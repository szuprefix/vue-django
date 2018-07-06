<template>
    <div>
        <el-button-group>
            <el-button type="plain" size="mini" icon="el-icon-edit" @click="onEdit">编辑</el-button>
            <el-button type="plain" size="mini" icon="el-icon-view" @click="onView">预览</el-button>
        </el-button-group>
        <el-row :gutter="40">
            <el-col :span="editZoneSpan">
                <el-input ref="content" type="textarea" :autosize="{ minRows: 24}" v-model="currentValue"
                          placeholder="请输入内容,一行一个, 用逗号隔开" @change="change"></el-input>
            </el-col>
            <el-col :span="viewZoneSpan">
                <el-table>
                    <el-table stripe :data="records">
                        <el-table-column :prop="f.name" :column-key="f.name" :label="f.label || f.name"
                                         :min-width="f.min_width" :width="f.width" :class-name="f.type"
                                         :type="f.type"
                                         :key="f.name" v-for="f in fields"></el-table-column>
                    </el-table>
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
            fields: Array
        },
        data () {
            return {
                edit: true,
                view: true,
                showAnswer: false,
                records: [],
                currentValue: null
            }
        },
        components: {
//            PaperView
        },
        mounted (){
            this.currentValue = this.value
        },
        methods: {
            genRecords: debounce(function () {
                let s = this.currentValue
                let fs = this.fields
                this.records = s.split('\n').map((l) => {
                    let d = {}
                    l.split(',').forEach((v,i) => { d[fs[i]] =  v})
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
//                if (value === this.currentValue) return
                this.currentValue = value
            },
        },
        computed: {
            editZoneSpan (){
                return this.edit ? (this.view ? 10 : 24) : 0
            },
            viewZoneSpan (){
                return this.view ? (this.edit ? 14 : 24) : 0
            }
        },
        watch: {
            'value'(val, oldValue) {
                this.currentValue = val
            },
            currentValue () {
                this.$emit('change', this.currentValue)
                this.genRecords()
            }
        }
    }
</script>
<style scoped>


</style>
