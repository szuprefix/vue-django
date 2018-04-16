<template>
    <div>
        <el-select v-model="value" :multiple="options.multiple" filterable @change="changed" remote
                   :remote-method="onFilter"
                   :loading="loading" :loading-text="loading" :placeholder="_placeholder">
            <el-option :label="c.__str__ || c.name || c.title" :value="c.id || c.pk || c.url || c.name"
                       v-for="c,i in table" :key="i"></el-option>
        </el-select>
        <el-button @click="toCreateModel" size="mini">
            <i class="fa fa-plus" :title="`新增${model.verboseName}`"></i>
        </el-button>
    </div>
</template>
<script>
    import list_view from '../../mixins/list_view'
    export default{
        mixins: [
            list_view
        ],
        props: {
            placeholder: String,
            options: {
                type: Object,
                default: function () {
                    return {}
                }
            },
            value: [String, Number, Array]
        },
        data () {
            return {
                choices: [],
                pageSize: 1000,
                search: ""
            }
        },
        created(){
            this.appModelName = this.options.model
        },
        methods: {
            changed(value){
                this.$emit('input', value)
            },
            onFilter(search){
                this.search = search
                this.updateQueries({search})
            }
        },
        computed: {
            _placeholder(){
                let p = this.placeholder || `请选择${this.model.verboseName}`
                if (p.indexOf('请选择') == 0) {
                    return p
                } else {
                    return `请选择${p}`
                }
            }
        }
    }
</script>
<style scoped></style>
