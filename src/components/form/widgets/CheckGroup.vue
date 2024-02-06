<template>
    <div class="check-group">
        <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="onAllChange" class="checkall">
            {{name}}
        </el-checkbox>
        <div class="options">
            <el-checkbox-group v-model="value" @change="onChange">
                <el-checkbox v-for="o in options" :label="o.value" :key="o.value">{{o.display_name}}</el-checkbox>
            </el-checkbox-group>
        </div>
    </div>
</template>
<script>
    export default {
        props: {
            value: Array,
            field: Object,
            name: {type: String, default: () => '全选'}
        },
        data() {
            return {
                checkAll: false,
                isIndeterminate: false
            }
        },
        created() {
            this.checkState()
        },
        methods: {
            onAllChange(val) {
                let rs = val ? this.options.map(a => a.value) : []
                this.$emit('input', rs)
                this.$emit('change', rs)
                this.checkState()

            },
            checkState() {
                let c = this.value.length
                this.checkAll = c === this.options.length
                this.isIndeterminate = c > 0 && c < this.options.length
            },
            onChange(value) {
                this.$emit('input', value)
                this.$emit('change', value)
                this.checkState()
            }
        },
        computed: {
            options () {
                return this.field.options
            }
        },
        watch: {
            value () {
                this.checkState()
            }
        }
    };
</script>
<style lang="less">
    .check-group {
        .checkall {
            .el-checkbox__label {
                font-weight: bold;
            }
        }
        .options {
            margin: 15px 0;
            padding: 0 2rem;
        }
    }
</style>