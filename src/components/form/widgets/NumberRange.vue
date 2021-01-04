<template>
    <el-dropdown @command="handleCommand" trigger="click" class="number-range">
        <el-button class="el-dropdown-link" :class="{empty: isEmpty}">
            {{field.label}} {{selectValue}}<i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-for="o in options" :command="o" v-key="o.text">{{o.text}}</el-dropdown-item>
            <el-dropdown-item :command="undefined">无</el-dropdown-item>
            <el-dropdown-item>
                <div @click.stop="noCommand">
                    <el-input-number v-model="range[0]" controls-position="right" clearable
                                     @change="onInputChange"></el-input-number>
                    -
                    <el-input-number v-model="range[1]" controls-position="right" clearable
                                     @change="onInputChange"></el-input-number>
                </div>
            </el-dropdown-item>
        </el-dropdown-menu>
    </el-dropdown>
</template>
<script>

    import {get} from 'lodash'
//    let DEFAULT_OPTIONS = [
//        {text: '0-99', range: [0, 99]},
//        {text: '100-199', range: [100, 199]},
//        {text: '200-299', range: [200, 299]},
//        {text: '300-', range: [300, 99999]}
//
//    ]
    export default{
        props: {
            value: String,
            field: Object,
            separator: {type: String, default: '至'}
        },
        data () {
            return {
                selectValue: '',
                range: [undefined, undefined]
            }
        },
        components: {},
        methods: {
            handleCommand (c) {
                if (!c) {
                    this.range = [undefined, undefined]
                    this.selectValue = null
                } else {
                    this.range = c.range
                    this.selectValue = c.text || this.genRangeText(c.range)
                }
            },
            noCommand() {

            },
            genRangeText(range) {
                if (!range[0] && !range[1]) {
                    return null
                }
                else if (!range[0] && range[1]) {
                    return `${range[1]}及以下`
                } else if (!range[1] && range[0]) {
                    return `${range[0]}及以上`
                } else {
                    return `${range[0]}-${range[1]}`
                }
            },
            onInputChange () {
                this.selectValue = this.genRangeText(this.range)
            }
        },
        computed: {
            isEmpty () {
                return !this.range[0] && !this.range[1]
            },
            options () {
                return get(this.field, 'options') || [] // || DEFAULT_OPTIONS
            }
        },
        watch: {
            selectValue(v){
                if (this.isEmpty) {
                    this.$emit('input', undefined)
                } else {
                    let min = this.range[0] || 0
                    let max = this.range[1] || 999999
                    this.$emit('input', `${min},${max}`)
                }
            }
        }
    }
</script>
<style>
    .number-range .empty {
        color: lightgray;
    }

    .el-input.range_begin, .el-input.range_end {
        width: 6rem;
        text-align: right;
    }
</style>
