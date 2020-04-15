<template>
    <el-autocomplete
            v-model="iValue"
            :value-key="valueKey"
            :fetch-suggestions="toSearch"
            :placeholder="field.placeHolder || field.label"
            clearable>

    </el-autocomplete>
</template>
<script>
    export default{
        props: {
            value: String,
            field: Object
        },
        data () {
            return {
                iValue: '',
                selectOptions: undefined
            }
        },
        components: {},
        created () {
            this.iValue = this.value
        },
        methods: {
            toSearch(qs, cb) {
                let p = this.selectOptions ? Promise.resolve() : this.load()
                p.then(() => {
                    this.search(qs, cb)
                })
            },
            search(qs, cb) {
                let b = qs && this.selectOptions.length>10
                var results = b ? this.selectOptions.filter(this.createFilter(qs)) : this.selectOptions
                cb(results)
            },
            createFilter(qs) {
                let t = qs.toLowerCase()
                let vk = this.valueKey
                return (item) => {
                    return (item[vk].toLowerCase().indexOf(t) === 0)
                }
            },
            load() {
                return this.$http.get(this.field.url).then(({data}) => {
                    let prepare = this.field.prepare ? this.field.prepare : a => a
                    this.selectOptions = prepare(data)
                })
            },
        },
        computed: {
            valueKey () {
                return this.field.valueKey || 0
            }
        },
        watch: {
            value (v) {
                this.iValue = v
            },
            iValue (v) {
               this.$emit('input', v)
            }
        }
    }
</script>
