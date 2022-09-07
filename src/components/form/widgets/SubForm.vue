<template>
    <div>
        <el-form-item :label="field.label" :rules="rules"></el-form-item>
        <x-form :items="field.items" v-model="value" submitName="" ref="form"></x-form>
    </div>
</template>
<script>
    import XForm from '../Form.vue'
    export default{
        props: {
            value: Object,
            field: Object
        },
        data () {
            return {}
        },
        components: {XForm},
        methods: {},
        computed: {
            rules () {
                return [
                    {
                        validator: (rule, value, callback) => {
                            return this.$refs.form.validate().then((valid) => {
                                    console.log(valid)
                                }
                            )
                        }
                    }
                ]
            }
        }
    }
</script>
