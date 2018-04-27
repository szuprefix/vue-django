<template>
    <div>
        {{modelData}} {{modelFormItems}}
        <el-table :data="modelData" size="mini" v-loading="loading" :element-loading-text="loading">
            <el-table-column :prop="f.name" :column-key="f.name" :label="f.label || f.name"
                             :class-name="`${f.type} field_${f.name}`" :type="f.type" v-for="f in modelFormItems"
                             :key="f.name">
                <template slot-scope="{row}">
                    <!--<component :is="f.widget" v-model="row" :prop="f.name"-->
                    <!--v-if="f.widget && typeof f.widget == 'object'"></component>-->
                    <!--<span v-else-if="f.widget && typeof f.widget == 'function'" v-html="f.widget(row)"></span>-->
                    <!--<template v-else>-->
                    <form-widget v-model="row" :field="f"></form-widget>
                    <!--</template>-->
                </template>
            </el-table-column>
            <el-table-column label="">
                <template slot="header">
                    <el-button><i class="fa fa-plus"></i>产品 </el-button>
                </template>
                <template slot-scope="{row}">
                    <el-button title="保存" size="mini" @click="formTableRowSave(row)">
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
    import model_form from '../../mixins/model_form'
    import FormWidget from '../widgets/FormWidget.vue'
    export default{
        mixins: [model_form],
        props: {
            appModelName: String,
//            value: {
//                type: Array, default: function () {
//                    return []
//                }
//            },
            dataUrl:String
        },
        created (){
            this.modelFormInit()
            this.$http.get(this.dataUrl).then(({data}) => {
                this.modelData = data.results
                console.log(this.modelData)
            }).catch(this.onServerResponseError)
        },
        data () {
            return {
                modelData:[]
            }
        },
        components: {FormWidget},
        methods: {
            formTableRowSave(row){

            }
        },
        computed: {}
    }
</script>
<style scoped></style>
