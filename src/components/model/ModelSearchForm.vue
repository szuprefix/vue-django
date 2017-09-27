<template>
    <el-form :model="options.values" class="search-form" inline v-if="options.values">

        <el-form-item :prop="options.values[f]"  label-width="0px" :key="f" v-for="v, f in options.values">
            <el-input v-model="options.values[f]" :placeholder="options.search_fields_label" @keyup.enter.native="submit" v-if="f === 'q'"></el-input>
            <el-select v-model="options.values[f]" :placeholder="`请选择${options.verbose_names[f]}`" clearable v-else>
                <el-option :label="c[1]" :value="c[0]" v-for="c in options.choices[f]" :key="c[0]"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label-width="0px">
            <el-button icon="search" @click="submit"></el-button>
        </el-form-item>
    </el-form>
</template>
<script>
    export default{
        props: {
            options: {
                type: Object, default: function () {
                    return {}
                }
            }
        },
        data () {
            return {
                formData: {}
            }
        },
        components: {},
        methods: {
            submit(){
                this.$emit("search",this.options.values)
            }
        },
        computed: {}
    }
</script>
<style>
    .search-form .el-select{
        width:130px;
    }
    .search-form{
        float:right;
        font-size:12px;
    }
    .search-form:after{
        clear: both;
    }
    .search-form .el-input{
        font-size:12px;
    }
</style>