<template>
    <div>
        <el-row type="flex" justify="space-between" style="padding-bottom: 20px;" v-if="!formInline">
            <el-col :span="18">
                <slot name="actions"></slot>
            </el-col>
            <el-col :span="6" class="flex-right">
                    <actions :items="top_actions"></actions>
            </el-col>
        </el-row>
        <r-form :formUrl="formUrl" :formItems="modelFormItems" v-model="formValue" ref="form"
                @beforesubmit="onBeforeSubmit" :formInline="formInline"
                :formMethod="formMethod" @form-posted="modelFormOnPosted" :formSubmit="modelFormSubmit"
                :formTextareaSize="formTextareaSize" :options="restFormOptions">
            <span slot="submit" v-if="!formInline"></span>
        </r-form>
    </div>
</template>
<script>
    import RForm from './Form.vue'
    import model_form from '../../mixins/model_form'
    import Actions from '../layout/Actions.vue'
    export default{
        mixins: [
            model_form
        ],
        props: {
            value: Object,
            id: [Number, String],
            onFormPosted: Function,
            topActionList: {
                type: Array, default: function () {
                    return ['delete', 'save']
                }
            },
            options: {
                type:Object,
                default: () => { return {}}
            }
        },
        data () {
            return {}
        },
        components: {
            RForm,Actions
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
            onBack() {
                this.$router.go(-1)
            },
            onDelete(){
                this.$confirm('确定要删除吗?', {type: 'warning'}).then(() => {
                    return this.modelDelete()

                }).then(() => {
//                    this.$emit("model-deleted", {model: this.modelConfig})
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
            },
            restFormOptions () {
                return Object.assign({}, this.options && this.options.restForm)
            }
        },
        watch: {
            // modelData(val){
            //     this.$emit("input", val)
            // },

            formValue(val){
                this.$emit("input", val)
            }
        }
    }
</script>
<style scoped></style>
