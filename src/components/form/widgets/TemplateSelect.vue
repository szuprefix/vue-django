<template>
    <div class="content-template-select">
        <el-tag @click="selectValue(t.name)" :type="t.type" hit effect="plain" v-for="t in templates" :key="t.name">{{t.name}}</el-tag>
    </div>

</template>
<script>
    import arrayNormalise from '../../../utils/array_normalize'
    export default{
        props: {
            value: String,
            field: Object,
            context: Object
        },
        data () {
            return {
                templates: arrayNormalise(this.field.templates, {})
            }
        },
        components: {},
        methods: {
            selectValue(v) {
                this.$emit('input', v)
            }
        },
        computed: {}
    }
</script>
<style>
    .content-template-select .el-tag {
        cursor: pointer;
        margin-right: 1rem;
    }
</style>
