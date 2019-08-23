<template>
    <div>
        <el-tooltip v-if="errors || warings" effect="dark" :content="infoStr" placement="top">
            <span :class="error?'error':'warning'">{{label}}</span>
        </el-tooltip>
        <template v-else>
            {{label}}
        </template>
    </div>
</template>
<script>
    export default{
        props: {
            value: [String, Number],
            field: Object,
            context: Object
        },
        components: {},
        methods: {},
        computed: {
            label(){
                let lb = this.value
                return lb == '' && this.errors && this.errorStr || lb
            },
            info(){
                let d = {errors: {}, warnings: {}}
                Object.assign(d, this.context['$local'])
                return d
            },
            errors(){
                return this.info.errors[this.column]
            },
            warnings(){
                return this.info.warnings[this.column]
            },
            infoStr(){
                let ts = []
                if (this.errors) {
                    ts = ts.concat(this.errors)
                }
                if (this.warnings) {
                    ts = ts.concat(this.warnings)
                }
                return ts.join(';')
            },
            column(){
                return this.field.name
            }
        }
    }
</script>
<style scoped>

    .error {
        color: #F56C6C;
    }

    .warning {
        color: #E6A23C;
    }

</style>
