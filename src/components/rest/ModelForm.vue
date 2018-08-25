<template>
    <div>
        <el-row type="flex" justify="space-between" style="padding-bottom: 20px;">
            <el-col :span="18">
                <slot name="actions"></slot>
            </el-col>
            <el-col :span="6" class="flex-right">
                <slot name="actions">
                    <el-button-group>
                        <el-button :type="a.type" :title="a.title" @click="a.do" v-for="a in top_actions"
                                   :key="a.name">
                            <i :class="`fa fa-${a.icon}`"></i>{{a.label}}
                        </el-button>
                    </el-button-group>
                </slot>

            </el-col>
        </el-row>
        <r-form :formUrl="formUrl" :formItems="modelFormItems" v-model="formValue" ref="form"
                @beforesubmit="onBeforeSubmit" :formInline="formInline"
                :formMethod="formMethod" @form-posted="modelFormOnPosted" :formSubmit="modelFormSubmit"
                :formTextareaSize="formTextareaSize">
            <span slot="submit"></span>
        </r-form>
    </div>
</template>
<script>
    import RForm from './Form.vue'
    import model_form from '../../mixins/model_form'
    export default{
        mixins: [
            model_form
        ],
        props: {
            appModelName: {
              type: String,
              default: () => ''
            },
            value: Object,
            id: [Number, String],
            onFormPosted: Function,
            topActionList: {
                type: Array, default: function () {
                    return ['save']
                }
            }
        },
        data () {
            return {

            }
        },
        components: {
            RForm
        },
        created(){
            this.modelFormInit()
            this.$on("model-delete", this.onDelete)
        },
        methods: {
            onBeforeSubmit(values){
                this.$emit("beforesubmit", values)
            },
            onSubmit(){
                this.$refs.form.onSubmit()
            },
            onDelete(){
                this.$confirm('确定要删除吗?', '提示', {type: 'warning'}).then(() => {
                    this.modelDelete()
                    this.$emit("model-deleted", {model: this.modelConfig})
                }).catch(this.onServerResponseError)
            },
            get_actions(action_list){
                return action_list.map((a) => {
                    if (typeof a == 'string' || a instanceof String) {
                        let d = this.modelFormAvairableActions[a]
                        d.name = a
                        return d
                    }
                    return a
                })
            },


        },
        computed: {
            top_actions(){
                return this.get_actions(this.topActionList)
            }
        },
        watch: {
            modelData(val){
                this.$emit("input", val)

            }
        }
    }
</script>
<style scoped></style>
