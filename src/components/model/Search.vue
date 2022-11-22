<template>
    <div>
        <div>
            <el-radio-group v-model="form[f.name]"  @change="onSearch" v-for="f in radioFilterFields" :key="f.name">
                <el-radio-button :label="c.value" v-for="c in f.choices" :key="c.value">{{c.display_name}}</el-radio-button>
            </el-radio-group>
        </div>
        <el-input title="模糊搜索, 多个关键词请用空格隔开"
                  :placeholder="`搜索${searchFieldNames}`"
                  v-model="form.search"
                  suffix-icon="el-icon-search"
                  @change="onSearch"
                  clearable
                  :style="`width:${searchFieldNames.length+5}rem;min-width:10rem;`"
                  ref="search"
                  v-if="searchFields.length>0">
        </el-input>
        <template v-for="f in notRadioFilterFields">
            <el-select v-model="form[f.name]" clearable :placeholder="`请选择${f.label}`" v-if="f.widget =='boolean'"
                       :title="f.label" :style="`width:${f.label.length+5}rem;min-width:8rem;`" @change="onSearch" :key="f.name">
                <el-option :label="f.label" :value="true"></el-option>
                <el-option :label="getBoolFieldFalseLabel(f.label)" :value="false"></el-option>
            </el-select>
            <model-select :field="f" v-model="form[f.name]" @input="onSearch"
                          :showCreate="false" :appModel="f.relateModel || f.model" :showLink="false"
                          :title="f.label" :style="`width:${f.label.length+5}rem;min-width:8rem;`"
                          v-else-if="f.widget === 'modelselect'" :pageSize="100" :key="f.name"></model-select>
            <el-select v-model="form[f.name]" clearable :placeholder="`请选择${f.label}`"
                       v-else-if="f.widget === 'select'" :key="f.name"
                       :title="f.label" @change="onSearch">
                <el-option v-for="c in f.choices" :label="c.display_name" :value="c.value" :key="c.value"></el-option>
            </el-select>
            <date-range :field="f" v-model="form[`${f.name}__range`]" separator="," :key="f.name"
                        :title="f.label" v-else-if="f.widget === 'daterange'" @input="onSearch"></date-range>

            <number-range :field="f" v-model="form[`${f.name}__range`]" separator="-" :options="f.options" :key="f.name"
                          :title="f.label" v-else-if="f.widget === 'numberrange'" @input="onSearch"></number-range>

            <array-input v-if="f.widget === 'array'" :key="f.name"
                         v-model="form[`${f.name}__in`]" :placeholder="`批量查询${f.label}`" style="width: 10rem;"
                         :title="f.label" :autosize="{minRows:1,maxRows:4}" @change="onSearch"></array-input>
            <el-input v-model="form[f.name]" :placeholder="`请输入${f.label}`"
                      v-else-if="f.widget === 'input'" :key="f.name"
                      :title="f.label" style="width: 10rem;" clearable @change="onSearch"></el-input>
        </template>
    </div>
</template>
<script>
    import DateRange from '../form/widgets/DateRange.vue'
    import NumberRange from '../form/widgets/NumberRange.vue'
    import ModelSelect from './Select.vue'
    import ArrayInput from '../widgets/ArrayInput.vue'
    import arrayNormalize from '../../utils/array_normalize'
    export default{
        props: {
            model: Object,
            items: Array,
            value: Object,
            map: {
                type: Object, default: () => {
                    return {}
                }
            },
            exclude: [Array, Object]
        },
        data () {
            return {
                orderingFields: [],
                filterFields: [],
                searchFields: [],
                baseQueries: {},
                form: {}
            }
        },
        components: {ModelSelect, ArrayInput, DateRange, NumberRange},
        created () {
            this.init()
        },
        mounted () {
            this.selectRadioDefault()
        },
        methods: {
            onSearch () {
                let f = this.form
                Object.keys(f).forEach(k => {
                    if(f[k] ===''){
                        console.log(k, f[k])
                        f[k] = null
                    }
                })
                this.$emit('change', {...f})
            },
            init () {
                this.form = {...this.value}
                let search = this.model.options.actions.SEARCH
                this.searchFields = search.search_fields
                let items = this.items || search.filter_fields
                let ss = this.model.viewsConfig.search || {}
                let ffields = arrayNormalize(items, this.model.fieldConfigs, (a) => {
                    let label = this.map[a.name] && this.map[a.name].label || a.label
                    let d = {widget: this.defaultWidget(a),...a, multiple: false, label, ...ss[a.name]}
                    return d
                })
                this.filterFields = this.reorder(ffields)
            },
            selectRadioDefault() {
                let b = false
                this.radioFilterFields.forEach(f => {
                    if(!this.form[f.name]) {
                        this.form[f.name] = f.choices[0].value
                        b =true
                    }
                })
                if(b) {
                    this.onSearch()
                }
            },
            defaultWidget (item) {
                let f = item
                if (f.type == 'boolean') {
                    return 'boolean'
                } else if (f.model /* && f.name !== this.genericContentTypeField */) {
                    return 'modelselect'
                } else if (f.choices) {
                    return 'select'
                } else if (['date', 'datetime'].includes(f.type) && f.lookups && f.lookups.includes('range')) {
                    return 'daterange'
                } else if (['number', 'integer', 'decimal'].includes(f.type) && f.lookups && f.lookups.includes('range')) {
                    return 'numberrange'
                } else if (['string', 'integer'].includes(f.type) && f.lookups && f.lookups.includes('in')) {
                    return 'array'
                } else if (['string', 'integer'].includes(f.type) && f.lookups && f.lookups.includes('exact') && !f.lookups.includes('in')) {
                    return 'input'
                }
            },
            reorder (items) {
                let os = ['boolean', 'radio', 'select', 'modelselect', 'input', 'array', 'numberrange', 'daterange']
                let rs = []
                os.forEach(w => {
                    rs = rs.concat(items.filter(a => a.widget === w))
                })
                return rs
            },
            choices2selectOptions(choices){
                return choices.map((a) => {
                    return {text: a.display_name, value: a.value}
                })
            },
            getBoolFieldFalseLabel(trueLabel){
                let l = trueLabel
                return l.startsWith('已') ? `未${l.substr(1)}` : (
                    l.startsWith('有') ? `无${l.substr(1)}` : (
                        l.startsWith('是') ? `非${l.substr(1)}` : `非${l}`
                    )
                )
            },
            getRelatedModel(name) {
                let model = this.model
                name.split('__').forEach(n => {

                })
            }
        },
        computed: {
            searchFieldNames () {
                let vns = []
                let fns = this.exclude instanceof Array && this.exclude || Object.keys(this.exclude)
                fns.forEach((a) => {
                    let c = this.model.fieldConfigs[a]
                    if (c) {
                        vns.push(c.label)
                    }
                })
                let rs = this.searchFields.filter((a) => !(a in vns))
                let vm = {}
                if (this.map) {
                    Object.keys(this.map).forEach(a => {
                        let c = this.model.fieldConfigs[a]
                        if (c) {
                            vm[c.label] = this.map[a].label
                        }
                    })
                }
                return rs.map(a => vm[a] || a).join(',')
            },
            genericContentTypeField () {
                let popt = this.model.options
                if (popt.generic_foreign_key) {
                    let {ct_field, fk_field} = popt.generic_foreign_key
                    return ct_field
                }
                return null
            },
            visiableFilterFields () {
                return this.filterFields.filter(f => !(f.name in this.exclude))
            },
            radioFilterFields () {
                return this.visiableFilterFields.filter(f => f.widget === 'radio')
            },
            notRadioFilterFields () {
                return this.visiableFilterFields.filter(f => f.widget !== 'radio')
            }
        },
        watch: {
            value(v) {
                this.form = {...v}
            },
            map () {
                this.init()
            }
        }
    }
</script>

