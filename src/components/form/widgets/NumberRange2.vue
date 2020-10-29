<template>
    <el-select class="number-range model-select" :placeholder="field.placeholder || `请选择${field.label}`" v-model="selectValue">
        <el-option v-for="a in options" :key="a.key" :label="a.label" :value="a.value"></el-option>
        <div>
            <el-input v-model="range[0]" :placeholder="`${field.label}最小`" class="range_begin" type="number" clearable @change="onChange"></el-input>
            -
            <el-input v-model="range[1]" :placeholder="`${field.label}最大`"  class="range_end" type="number" clearable @change="onChange"></el-input>
        </div>
        <template #empty>
            <div>
                <el-input v-model="range[0]" :placeholder="`${field.label}最小`" class="range_begin" type="number" clearable @change="onChange"></el-input>
                -
                <el-input v-model="range[1]" :placeholder="`${field.label}最大`"  class="range_end" type="number" clearable @change="onChange"></el-input>
            </div>
        </template>
    </el-select>
</template>
<script>
    export default{
        props: {
            value: String,
            field: Object,
            separator: {type: String, default: '至'}
        },
        data () {
            return {
                options: [],
                defaultSeparator: '-',
                selectValue: '',
                range: [undefined, undefined]
            }
        },
        components: {},
        mounted () {
            this.setRange()
        },
        methods: {
            setRange () {
                if(!this.value) {
                    this.range = [undefined, undefined]
                } else {
                    let ps = this.value.split(this.separator).map(a => {
                        return parseInt(a) || undefined
                    })
                    if(ps.length<2) {
                        ps.append(undefined)
                    }
                    this.range = ps
                }

            },
            onChange () {
                let r = this.range
                let s = r.join(this.separator) || undefined
                this.selectValue = s
                let label= (r[0] || r[1]) ? s.replace(this.separator, this.defaultSeparator) : ''
                let opt = {key: 'self', label, value: s}
                this.options = this.options.filter(a => a.key!== opt.key).concat([opt])
                this.$emit(s)
            }
        },
        computed: {},
        watch: {
            range () {
                this.onChange()
            }
        }
    }
</script>
<style>
    .el-input.range_begin, .el-input.range_end {
        width: 10rem;
        text-align: right;
    }
</style>
