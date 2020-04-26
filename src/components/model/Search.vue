<template>
    <div>
        <el-input
                :placeholder="`搜索${searchFieldNames}`"
                v-model="value.search"
                suffix-icon="el-icon-search"
                @change="onSearch"
                clearable
                :style="`width:${searchFieldNames.length+5}rem;min-width:10rem;`"
                ref="search"
                v-if="searchFields.length>0">
        </el-input>
        <template v-for="f in filterFields" v-if="! (f.name in exclude)">
            <el-select v-model="value[f.name]" clearable :placeholder="`请选择${f.label}`" v-if="f.type=='boolean'"
                       :title="f.label" :style="`width:${f.label.length+5}rem;min-width:8rem;`" @change="onSearch">
                <el-option :label="f.label" :value="true"></el-option>
                <el-option :label="getBoolFieldFalseLabel(f.label)" :value="false"></el-option>
            </el-select>
            <model-select :field="f" v-model="value[f.name]" @input="onSearch"
                          :showCreate="false" :appModel="f.model"
                          :title="f.label" :style="`width:${f.label.length+5}rem;min-width:8rem;`"
                          v-else-if="f.model && f.name !== genericContentTypeField" :pageSize="100"></model-select>
            <el-select v-model="value[f.name]" clearable :placeholder="`请选择${f.label}`" v-else-if="f.choices"
                       :title="f.label" @change="onSearch">
                <el-option v-for="c in f.choices" :label="c.display_name" :value="c.value" :key="c.value"></el-option>
            </el-select>
            <date-range :field="f" v-model="value[`${f.name}__range`]" separator=","
                        :title="f.label" v-else-if="['date', 'datetime'].includes(f.type)" @input="onSearch"></date-range>
        </template>

        <template v-for="f in filterFields" v-if="! (f.name in exclude)">
            <array-input v-if="f.type === 'string' && f.lookups && f.lookups.includes('in')"
                         v-model="value[`${f.name}__in`]" :placeholder="`批量查询${f.label}`" style="width: 10rem;"
                         :title="f.label" :autosize="{minRows:1,maxRows:4}" @change="onSearch"></array-input>
            <el-input v-model="value[f.name]" :placeholder="`请输入${f.label}`"
                      v-else-if="f.type === 'string' && f.lookups && f.lookups.includes('exact') && !f.lookups.includes('in') && !searchFields.includes(f.label)"
                      :title="f.label" style="width: 10rem;" clearable @change="onSearch"></el-input>
        </template>
    </div>
</template>
<script>
    import DateRange from '../form/widgets/DateRange.vue'
    import ModelSelect from './Select.vue'
    import ArrayInput from '../widgets/ArrayInput.vue'
    import array_normalize from '../../utils/array_normalize'
    export default{
        props: {
            model: Object,
            items: Array,
            value: Object,
            map: {type: Object, default: {}},
            exclude: [Array, Object]
        },
        data () {
            return {
                orderingFields: [],
                filterFields: [],
                searchFields: [],
                baseQueries: {}
            }
        },
        components: {ModelSelect, ArrayInput, DateRange},
        created () {
        },
        methods: {
            onSearch () {
                this.$emit('change', this.value)
            },
            init () {
                let search = this.model.options.actions.SEARCH
                this.searchFields = search.search_fields
                let items = this.items || search.filter_fields
                let ffields = array_normalize(items, this.model.fieldConfigs, (a) => {
                    let label = this.map[a.name] && this.map[a.name].label || a.label
                    return {multiple: false, ...a, label, widget: this.defaultWidget(a)}
                })
                this.filterFields = this.reorder(ffields)
                this.filters = Object.assign({}, this.getFilters())
            },
            defaultWidget (item) {
                let f = item
                if (f.type=='boolean') {
                    return 'boolean'
                } else if (f.model && f.name !== this.genericContentTypeField) {
                    return 'modelselect'
                } else if (f.choices) {
                    return 'select'
                } else if (['date', 'datetime'].includes(f.type)) {
                    return 'daterange'
                } else if (f.type === 'string' && f.lookups && f.lookups.includes('in')) {
                    return 'array'
                } else if (f.type === 'string' && f.lookups && f.lookups.includes('exact') && !f.lookups.includes('in') && !this.searchFields.includes(f.label)) {
                    return 'input'
                }
            },
            reorder (items) {
                let os = ['boolean', 'select', 'modelselect','daterange', 'input', 'array']
                let rs = []
                os.forEach(w => {
                    rs = rs.concat(items.filter(a => a.widget === w))
                })
                return rs
            },
            getFilters(){
                let postFields = this.model.fieldConfigs
                let filters = {}

                Object.keys(postFields).forEach((k) => {
                    let f = postFields[k]
                    if (f.choices) {
                        filters[`${k}_name`] = filters[k] = this.choices2selectOptions(f.choices)
                    }
                })
                return filters
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
                return this.searchFields.filter((a) => !(a in vns)).join(',')
            },
            genericContentTypeField () {
                let popt = this.model.options
                if (popt.generic_foreign_key) {
                    let {ct_field, fk_field} = popt.generic_foreign_key
                    return ct_field
                }
            }
        },
        watch: {
            map () {
                this.init()
            }
        }
    }
</script>

