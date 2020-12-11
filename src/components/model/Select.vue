<template>
    <el-select v-model="selectedValue" :disabled="field.disabled" ref="select" :class="`related-select ${field.name}`"
               :multiple="field.multiple" filterable @change="changed" remote clearable reserve-keyword
               :remote-method="onFilter" default-first-option
               :loading="loading" :loading-text="`${loading}`"
               :placeholder="field.placeholder || `请选择${field.label}`">
        <el-option :label="c.__str__ || c.name || c.title" :value="c[idField] || c.pk || c.url || c.name"
                   v-for="c in optionList" :key="c[idField] || c.pk || c.url || c.name">
            <span>{{c[selectOptionsFields[0]]}}</span>
            <i v-if="showLink" class="fa fa-link" title="跳转到详情页" @click="$router.push(modelDetailPath)"></i>
            <span class="label-right" v-if="selectOptionsFields[1]">{{c[selectOptionsFields[1]]}}</span>
        </el-option>
        <el-alert type="info" v-if="moreThanOnePage" show-icon title="记录太多未展示完全,请输入关键字进行搜索" :closable="false">
        </el-alert>

        <el-alert v-if="showCreate && canAdd" @click.native="toCreateModel" type="warning" center
                  style="cursor: pointer"
                  :closable="false">
            <i class="fa fa-plus" style="margin-right: 1rem"></i>新增{{field.label}}
        </el-alert>
        <template #empty>
            <el-alert v-if="showCreate && canAdd" @click.native="toCreateModel" type="warning" center
                      style="cursor: pointer" :closable="false">
                <i class="fa fa-plus" style="margin-right: 1rem"></i>新增{{field.label}}
            </el-alert>
        </template>
    </el-select>
</template>
<script>
    import {DEFAULT_PAGE_SIZE} from '../table/Table'
    import Qs from 'qs'
    import {uniqWith, isEqual} from 'lodash'
    import Model from './Model'
    import serverResponse from 'vue-django/src/mixins/server_response'
    export default{
        mixins: [serverResponse],
        props: {
            appModel: String,
            placeholder: String,
            field: {type:Object, default: () => {return {}}},
            showCreate: {type: Boolean, default: true},
            value: [String, Number, Array],
            showLink: {type: Boolean, default: true}
        },
        data() {
            return {
                model: Model(this.appModel, this.defaults, this.$store.state.bus),
                data: [],
                selectedObjects: [],
                selectOptionsFields: ['__str__'],
                selectedValue: this.value,
                moreThanOnePage: false,
                search: ''
            }
        },
        created(){
//            console.log(this.field)
            this.model.init()
            this.selectOptionsFields = this.model.config.selectOptionsFields || ['__str__']
//            Object.assign(this.tableQueries, this.field.baseQueries, this.baseQueries)
            this.loadValueObjects(this.value).then(() => {
                return this.load()
            })
        },

        mounted () {
            this.$store.state.bus.$on('model-posted', this.onModelPosted)
            this.$store.state.bus.$on('model-deleted', this.onModelPosted)
        },
        beforeDestroy () {
            this.$store.state.bus.$off('model-posted', this.onModelPosted)
            this.$store.state.bus.$off('model-deleted', this.onModelPosted)
        },
        methods: {

            onModelPosted ({appModel, id}) {
                let dps = this.model.options.dependencies
                if (appModel === this.appModel || dps && dps.includes(appModel)) {
                    this.load()
                }
            },
            loadValueObjects(v){
                if (['number', 'string'].includes(typeof v)) {
                    v = [v]
                }
                if (!v || v.length === 0) {
                    return Promise.resolve()
                }
                let qs = Object.assign({}, this.field.baseQueries)
                qs[`${this.idField}__in`] = v.join(',')
                qs['page_size'] = v.length
                return this.loadData(qs).then(({data}) => {
                    this.selectedObjects = data.results
                })
            },
            loadData (queries) {
                let qs = Object.assign({}, queries)
                return this.$http.get(`${this.url}?${Qs.stringify(qs)}`)
            },
            load (qs) {
                return this.loadData(Object.assign({page_size: DEFAULT_PAGE_SIZE}, this.field.baseQueries, qs)).then(({data}) => {
                    this.data = data.results
//                    if (data.count === 1 && !this.selectedValue) {
//                        let nv = this.data[0][this.idField]
//                        this.$emit('input', nv)
//                        this.selectedObjects = this.data
//                    }
                    this.moreThanOnePage = data.next
                })
            },
            changed(value){
                this.$emit('input', value)
            },
            onFilter(search){
                this.search = search
                this.load({search})
            },
            toCreateModel(row){
                this.$refs.select.blur()
                let url = `${this.url}create/?${this.model.config.title_field || 'name'}=${this.search}`
                this.$router.push(url)
            },
            checkPermission(p, m){
                m = m || this
                let ps = this.$store.state.user.model_permissions[m.appModel]
                return ps && ps.includes(p)
            },
        },
        computed: {
            _placeholder(){
                let p = this.placeholder || `请选择${this.model.config.verboseName}`
                if (p.indexOf('请选择') == 0) {
                    return p
                } else {
                    return `请选择${p}`
                }
            },
            optionList(){
                return uniqWith(this.selectedObjects.concat(this.data), isEqual)
            },
            url () {
                return this.model.getListUrl()
            },
            canAdd () {
                return this.checkPermission('create')
            },
            idField() {
                return this.field.idField || 'id'
            },
            modelDetailPath () {
                return this.model.getDetailUrl(this.selectedValue)
            }
        },
        watch: {
            selectedValue(v){
                this.loadValueObjects(v)
            },
            value (v) {
                this.selectedValue = v
            }
        }
    }
</script>
<style>
    .el-select-dropdown__item .label-right {
        float: right;
        color: #8492a6;
        font-size: 0.8rem;
    }

    .el-select-dropdown__item .fa-link {
        display: none;
    }

    .el-select-dropdown__item.selected .fa-link {
        display: inline-block;
        margin-top: 0.5rem;
        margin-left: 0.5rem;
        cursor: pointer;
        color: gray;
        float: right;
    }
</style>
