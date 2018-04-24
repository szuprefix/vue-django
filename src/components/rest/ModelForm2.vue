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
        <r-form :formUrl="isCreate?modelListUrl:modelDetailUrl" :formItems="_formItems" v-model="formValue" ref="form"
                :formMethod="isCreate?'post':'put'" @form-posted="formPosted" :formSubmit="submit">
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
            value:Object
        },
        data () {
            return {}
        },
        components: {
            RForm
        },
        created(){
            console.log("modelForm2.created")
            this.modelInit()
            this.modelLoad().then(() => {
                this.formValue = Object.assign({}, this.modelData)
            })
        },
        methods: {

            formPosted(data){
                this.$emit("form-posted", {model: this.value})
            },
            onSubmit(){
                this.$refs.form.onSubmit()
            }

        },
        computed: {
            isCreate () {
                return !this.modelId
            },
            _formItems() {
                return this.formNormalizeItems(this.modelFormItems(this.formItems))
            }
        }
    }
</script>
<style scoped></style>
