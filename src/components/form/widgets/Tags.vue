<template>
    <el-select v-model="tags" multiple placeholder="请选择">
        <el-option
                v-for="item in field.tags"
                :key="item"
                :label="item"
                :value="item">
        </el-option>
    </el-select>
</template>
<script>
    export default{
        props: {
            value: String,
            field: Object
        },
        data () {
            return {
                tags: []
            }
        },
        components: {},
        created () {
            this.tags = this.value.split(',').filter(a => a.trim().length>0)
        },
        methods: {
            onChange(v) {
                this.$emit('input', v / 100)
            }
        },
        watch: {
            value (v) {
                this.tags = this.value.split(',').filter(a => a.trim().length>0)
            },
            tags () {
                this.$emit('input', this.tags.join(','))
            }
        }
    }
</script>
