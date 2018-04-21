<template>
    <div>
       {{model.config}} {{fieldMetas}}
        <el-table :data="table" size="mini" v-loading="loading" :element-loading-text="loading">
            <el-table-column :prop="f.name" :column-key="f.name" :label="f.label || f.name"
                             :class-name="f.type" :type="f.type" v-for="f in _fields" :key="f.name">
                <template slot-scope="{row}">
                    <component :is="f.widget" v-model="row" :prop="f.name"
                               v-if="f.widget && typeof f.widget == 'object'"></component>
                    <span v-else-if="f.widget && typeof f.widget == 'function'" v-html="f.widget(row)"></span>
                    <template v-else>
                        <el-input v-model="row[f.name]" size="mini"></el-input>
                    </template>
                </template>
            </el-table-column>
            <el-table-column label="">
                <template slot="header">
                    <el-button><i class="fa fa-plus"></i>产品 </el-button>
                </template>
                <template slot-scope="{row}">
                    <el-button title="保存" size="mini" @click="save(row)">
                        <i :class="`fa fa-floppy-o`"></i>
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <div class="flex-right">
            <el-button title="新增" size="small">
                <i class="fa fa-plus"></i>
            </el-button>
        </div>
    </div>
</template>
<script>
    import list_view from '../../mixins/list_view'
    export default{
        mixins: [list_view],
        props: {
            appModelName: String,
            fields: {
                type: Array, default: function () {
                    return []
                }
            },
            value: {
                type: Array, default: function () {
                    return []
                }
            },
            fieldMetas: {
                type: Object, default: function () {
                    return {}
                }
            },
            dataUrl: String,
        },
        created (){
            if (this.dataUrl != null) {
                this.url = this.dataUrl
            }
        },
        data () {
            return {}
        },
        components: {},
        methods: {

            getWidget (f) {
                if (f.type == 'field' && f.model) {
                    return 'RelatedSelect'
                }
                if (['field', 'choice'].includes(f.type) && f.choices) {
                    return 'select'
                }
                return f.type == 'boolean' ? 'checkbox' : ( f.type == 'decimal' ? 'number' : 'text')
            },
            save(row){

            }
        },
        computed: {
            _fields(){
                if(!this.model.config){
                    return []
                }
                let fm = this.fieldMetas = this.model.config.rest_options && this.model.config.rest_options.actions.POST || {}
                return this.fields.map((f) => {
                    if (typeof f == 'string') {
                        let d = fm[f]
                        if (d) {
                            return {name: f, label: d.label, type: d.type, widget: this.getWidget(d)}
                        } else {
                            return {name: f, label: f}
                        }
                    }
                    return f
                })
            },
        }
    }
</script>
<style scoped></style>
