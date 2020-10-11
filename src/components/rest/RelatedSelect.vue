<template>
    <span>
        <el-select v-model="selectedValue" :disabled="field.disabled"
                   :multiple="field.multiple" filterable @change="changed" remote clearable reserve-keyword
                   :remote-method="onFilter" :class="`related-select ${field.name}`" default-first-option
                   :loading="loading" :loading-text="loadingText"
                   :placeholder="field.placeholder || `请选择${field.label}`">
            <el-option :label="c.__str__ || c.name || c.title" :value="c.id || c.pk || c.url || c.name"
                       v-for="c,i in optionList" :key="c.id || c.pk || c.url || c.name">
                <span>{{c[selectOptionsFields[0]]}}</span>
                <span class="label-right" v-if="selectOptionsFields[1]">{{c[selectOptionsFields[1]]}}</span>
            </el-option>
            <el-option v-if="tableCount>tablePageSize" value="" disabled>记录太多未展示完全,请输入关键字进行搜索</el-option>

        </el-select>
            <i class="fa fa-plus" :title="`新增${field.label}`" @click="toCreateModel" v-if="showCreate"
               style="cursor: pointer">
            </i>
    </span>
</template>
<script>
    import model_view from '../../mixins/model_view'
    import table_view from '../../mixins/table_view'
    import Qs from 'qs'
    import {uniqWith, isEqual} from 'lodash'
    export default{
        mixins: [model_view, table_view],
        props: {
            placeholder: String,
            field: Object,
            showCreate: {type: Boolean, default: true},
            value: [String, Number, Array],
            modelListSubUrl: String
        },
        data() {
            return {
                selectedObjects:[],
                selectOptionsFields: ['__str__'],
                selectedValue: this.value
            }
        },
        created(){
            this.modelInit()
            if(this.modelConfig.selectOptionsFields){
                this.selectOptionsFields = this.modelConfig.selectOptionsFields
            }
            Object.assign(this.tableQueries, this.field.tableBaseQueries)
            this.tableUrl = this.modelListSubUrl && `${this.modelListUrl}${this.modelListSubUrl}/` || this.modelListUrl
            this.loadValueObjects(this.value).then(()=>{
                this.tableUpdateQueries(this.field.queries)
            })
        },
        methods: {
            loadValueObjects(v){
                let qs = {}
                if (['number', 'string'].includes(typeof v)){
                    v=[v]
                }
                if(!v || v.length === 0){
                    return Promise.resolve()
                }
                qs['id__in'] = v.join(',')
                qs['page_size'] = v.length
                return this.$http.get(`${this.tableUrl}?${Qs.stringify(qs)}`).then( ({data}) => {
                    this.selectedObjects = data.results
                })
            },
            changed(value){
                this.$emit('input', value)
            },
            onFilter(search){
                this.tableUpdateQueries({search})
            },
            toCreateModel(row){
                let url = `${this.tableUrl}create/?${this.modelConfig.title_field || 'name'}=${this.tableQueries.search}`
                this.$router.push(url)
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
            },
            optionList(){
                return uniqWith(this.selectedObjects.concat(this.tableData),isEqual)
            }

        },
        watch:{
            selectedValue(v){
                this.loadValueObjects(v)
            }
        }
    }
</script>
<style scoped>
    .label-right{
        float:right;color: #8492a6; font-size:0.8rem;
    }
</style>
