<template>
    <div>
        <div>
            <el-radio-group v-model="form[f.name]" @change="onSearch" v-for="f in radioFilterFields" :key="f.name">
                <el-radio-button :label="c.value" v-for="c in f.choices" :key="c.value">{{c.display_name}}
                </el-radio-button>
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
                  v-if="searchFieldNames.length>0">
        </el-input>
        <template v-for="f in notRadioFilterFields">
            <el-select v-model="form[f.name]" clearable :placeholder="`请选择${f.label}`" v-if="f.widget =='boolean'"
                       :title="f.label" :style="`width:${f.label.length+5}rem;min-width:8rem;`" @change="onSearch"
                       :key="f.name">
                <el-option :label="f.label" :value="true"></el-option>
                <el-option :label="getBoolFieldFalseLabel(f.label)" :value="false"></el-option>
            </el-select>
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
                         v-model="value[`${f.name}__in`]" :placeholder="`批量查询${f.label}`" style="width: 10rem;"
                         :title="f.label" :autosize="{minRows:1,maxRows:4}" @change="onSearch"></array-input>
            <component :is="f.widget" :field="f" v-bind="[f]" v-model="form[f.name]" @input="onSearch"
                       v-else-if="f.widget instanceof Object" :pageSize="100" :key="f.name"></component>
            <el-input v-model="form[f.name]" :placeholder="`请输入${f.label}`" :key="f.name"
                      v-else-if="f.widget === 'input'"
                      :title="f.label" style="width: 10rem;" clearable @change="onSearch"></el-input>
        </template>
    </div>
</template>
<script>
    import DateRange from '../form/widgets/DateRange.vue'
    import NumberRange from '../form/widgets/NumberRange.vue'
    import ArrayInput from '../widgets/ArrayInput.vue'
    import arrayNormalize from '../../utils/array_normalize'
    export default{
        props: {
            items: Array,
            value: Object,
            map: {
                type: Object, default: () => {
                    return {}
                }
            },
            exclude: {type: [Array, Object], default: () => []},
            searchFieldNames: {type: String, default: ''}
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
        components: {ArrayInput, DateRange, NumberRange},
        created () {
            this.init()
        },
        mounted () {
            this.selectRadioDefault()
        },
        methods: {
            onSearch () {
                this.$emit('change', {...this.form})
            },
            init () {
                this.form = {...this.value}
                let items = this.items
                let ffields = arrayNormalize(items, {}, (a) => {
                    let label = this.map[a.name] && this.map[a.name].label || a.label
                    let d = {widget: this.defaultWidget(a), ...a, multiple: false, label}
                    return d
                })
                this.filterFields = this.reorder(ffields)
            },
            selectRadioDefault() {
                let b = false
                this.radioFilterFields.forEach(f => {
                    if (!this.form[f.name]) {
                        this.form[f.name] = f.choices[0].value
                        b = true
                    }
                })
                if (b) {
                    this.onSearch()
                }
            },
            defaultWidget (item) {
                let f = item
                if (f.type == 'boolean') {
                    return 'boolean'
                } else if (f.model) {
                    return 'modelselect'
                } else if (f.choices) {
                    return 'select'
                } else {
                    return 'input'
                }
            },
            reorder (items) {
                let os = ['boolean', 'radio', 'select', 'modelselect', 'input', 'array', 'numberrange', 'daterange']
                let rs = []
                os.forEach(w => {
                    rs = rs.concat(items.filter(a => a.widget === w))
                })
                items.filter(a => !os.includes(a.widget)).forEach(a => {
                    rs.push(a)
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
            }
        },
        computed: {
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

