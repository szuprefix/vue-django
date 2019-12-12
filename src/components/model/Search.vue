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
                       @change="onSearch">
                <el-option :label="f.label" :value="true"></el-option>
                <el-option :label="getBoolFieldFalseLabel(f.label)" :value="false"></el-option>
            </el-select>
            <model-select :field="f" v-model="value[f.name]" @input="onSearch"
                          :showCreate="false" :appModel="f.model"
                          v-if="f.model" :pageSize="100"></model-select>
        </template>
    </div>
</template>
<script>
    import ModelSelect from './Select.vue'
    export default{
        props: {
            model: Object,
            items: Array,
            value: Object,
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
        components: {ModelSelect},
        created () {
        },
        methods: {
            onSearch () {
                this.$emit('change', this.value)
            },
            init () {
                let search = this.model.options.actions.SEARCH
                this.searchFields = search.search_fields
                let filterItems = this.items || search.filter_fields
                this.filterFields = filterItems.map((a) => {
                    return Object.assign({multiple: false}, this.model.fieldConfigs[a])
                })
                this.filters = Object.assign({}, this.getFilters())
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
        }
    }
</script>

