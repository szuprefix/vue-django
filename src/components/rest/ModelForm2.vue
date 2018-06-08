<template>
    <div>
        <el-row type="flex" justify="space-between" style="padding-bottom: 20px;">
            <el-col :span="20">
                <slot name="actions"></slot>
            </el-col>
            <el-col :span="4" class="flex-right">
                <slot name="actions">
                    <el-button-group>
                        <el-button type="primary" :title="a.title" @click="a.do" v-for="a in top_actions"
                                   :key="a.name">
                            <i :class="`fa fa-${a.icon}`"></i>
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
    import RForm from './Form2.vue'
    import model_form from '../../mixins/model_form'
    export default{
        mixins: [
            model_form
        ],
        props: {
            appModelName: String,
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
            return {}
        },
        components: {
            RForm
        },
        created(){
            this.modelFormInit()
        },
        methods: {
            onBeforeSubmit(values){
                this.$emit("beforesubmit", values)
            },
            onSubmit(){
                this.$refs.form.onSubmit()
            },

            get_actions(action_list){
                return action_list.map((a) => {
                    let d = this.modelFormAvairableActions[a]
                    d.name = a
                    return d
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
