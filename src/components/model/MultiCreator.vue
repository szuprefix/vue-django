<template>
    <div>
        <div>
            <el-button-group>
                <el-button type="plain" size="mini" icon="el-icon-edit" @click="onEdit">编辑</el-button>
                <el-button type="plain" size="mini" icon="el-icon-view" @click="onView">预览</el-button>
            </el-button-group>
            <el-radio-group v-model="splitChar" size="mini">
                <el-radio-button :label="'\t'" title="字段用Tab符分隔">TAB</el-radio-button>
                <el-radio-button label="," title="字段用逗号分隔">,</el-radio-button>
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
    import ForeignKeyTranslater from '../../utils/foreign_key_translater'
    import Model from './Model'
    import {debounce} from 'lodash'
    import Qs from 'qs'
    import arrayNormalize from '../../utils/array_normalize'
    export default{
        model: {
            event: "change"
        },
        props: {
            value: {
                type: String,
                default: ''
            },
            items: Array,
            appModel: String,
            defaults: {
                type: Object, default: () => {
                    return {}
                }
            },
            pk: {type: String}
        },
        data () {
            return {
                model: Model(this.appModel, this.defaults, this.$store.state.bus),
                edit: true,
                view: true,
                records: [],
                currentValue: null,
                splitChar: '\t',
                began: false,
                queueIndex: 0,
                tmap: {},
                fieldItems: []
            }
        },
        components: {
//            PaperView
        },
        mounted (){
            this.currentValue = this.value
            this.model.loadOptionsAndViewsConfig()
                .then(this.normalizeItems)
                .then(this.loadForeignKeyTranslater)
                .then(this.genRecords)
        },
        methods: {
            loadForeignKeyTranslater(){
                Object.keys(this.model.fieldConfigs).forEach((fn) => {
                    let f = this.model.fieldConfigs[fn]
                    if (f.model && f.multiple != true) {
                        ForeignKeyTranslater.getMap(f.model).then((rs) => {
                            let m = {}
                            rs.forEach((d) => {
                                m[d.name] = d.id
                            })
                            this.tmap[f.name] = {map: m, field: f}
//                            console.log(this.tmap)
                        })
                    }
                })
                return Promise.resolve()
            },
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
            normalizeItems() {
                this.fieldItems = arrayNormalize((this.items || this.viewConfig.items), this.model.fieldConfigs)
            },
            onEdit () {
                this.edit = true
                this.view = !this.view
            },
            onView () {
                this.view = true
                this.edit = !this.edit
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
            translateForeignKey(a){
                Object.keys(this.tmap).forEach((fn) => {
                    let t = this.tmap[fn]
                    let f = t.field
                    let m = t.map
                    a[f.name] = m[a[f.name]]
                    console.log(a)
                })

            },
            postOne(){
                let qi = this.queueIndex
                let pkn = this.pk || this.viewConfig.pk || 'code'
                if (qi < this.records.length) {
                    let a = Object.assign({}, this.defaults, this.records[qi])
                    this.translateForeignKey(a)
                    let q = {}
                    q[pkn] = a[pkn]
                    this.$http.get(`${this.model.getListUrl()}?${Qs.stringify(q)}`).then(({data}) => {
                        if (data.count > 0) {
                            let r = data.results[0]
                            a = Object.assign(r, a)
                            return this.$http.put(`${this.model.getListUrl()}${a.id}/`, a)
                        } else {
                            return this.$http.post(`${this.model.getListUrl()}`, a)
                        }
                    }).then(() => {
                        this.setResult(qi, {status: 'success', info: '成功'})
                    }).catch((error) => {
                        this.setResult(qi, {status: 'failed', info: error.msg})
                    }).then(() => {
                        this.postOne()
                    })
                } else {
                    this.model.emitPosted()
                    console.log("batch done")
                }
                this.queueIndex += 1
            }
        },
        computed: {
            loaded(){
                return Object.keys(this.model.fieldConfigs).length > 0
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
            viewConfig () {
                return this.model.viewsConfig.batch
            }
        },
        watch: {
            'value'(val) {
                this.currentValue = val
            },
            currentValue () {
                this.$emit('change', this.currentValue)
                this.genRecords()
            },
            items () {
                this.normalizeItems()
            },
            splitChar () {
                this.genRecords()
            }
        }
    }
</script>
