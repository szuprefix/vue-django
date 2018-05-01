<template>
    <div>
        <el-row type="flex" justify="space-between" style="padding-bottom: 20px;">
            <el-col :span="20">
                <slot name="actions"></slot>
            </el-col>
            <el-col :span="4" class="flex-right">
                <el-button type="primary" @click="onSubmit" :title="formSubmitName || '保存'">
                    <i class="fa fa-floppy-o" aria-hidden="true"></i>
                </el-button>
            </el-col>
        </el-row>
        <r-form :formUrl="formUrl" :formItems="modelFormItems" v-model="formValue" ref="form"
                :formMethod="formMethod" @form-posted="modelFormOnPosted" :formSubmit="modelFormSubmit" :formTextareaSize="formTextareaSize">
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
            id:[Number,String],
            onFormPosted: Function
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

            onSubmit(){
                this.$refs.form.onSubmit()
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
