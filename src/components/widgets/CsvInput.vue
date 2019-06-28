<template>
    <div>
        <!--<div class="csvinput-fields">-->
        <!--<el-tag class="csvinput-fields__item" v-for="f in field.items" :key="f.name">{{f.label}}</el-tag>-->
        <!--</div>-->
        <el-input ref="content" type="textarea" :autosize="{ minRows: 16}" v-model="currentValue"
                  :placeholder="contentSample" @change="change"></el-input>
    </div>
</template>
<script>
    import {debounce} from 'lodash'
    import Sortable from 'sortablejs'
    export default{
        props: {
            value: {
                type: String,
                default: ''
            },
            field: Object,
        },
        data () {
            return {
                delimit: null,
                matrix: [],
                records: [],
                currentValue: '',
                allDelimits: {',': '逗号', '|': '竖线', '\t': 'Tab'}
            }
        },
        mounted (){
            this.currentValue = this.value

        },
        components: {},
        methods: {
            createSortableTags(){
                let el = this.$el.querySelector('.csvinput-fields')
                Sortable.create(el, {
                    store: {
                        set: function (sortable) {
                            var order = sortable.toArray()
                            console.log(order)
//                        localStorage.setItem(sortable.options.group.name, order.join('|'));
                        }
                    }
                })
            },
            guessDelimit(l){
//                if(this.delimit){
//                    return
//                }
                let ds = this.allDelimits
                return Object.keys(ds).map((a) => {
                    return [l.split(a).length, a]
                }).sort().reverse()[0][1]
            },
            genRecords: debounce(function () {
                let ls = this.lines
                if (ls.length === 0) {
                    this.matrix = []
                }else{
                    this.matrix = ls.map(a => a.split(this._delimit))
                }

                this.records = this.matrix.map((l) => {
                    let d = {}
                    l.forEach((v, i) => {
                        let mx = this.fieldItems.length - 1
                        let fn = this.fieldItems[i <= mx ? i : mx].name
                        d[fn] = d[fn] ? d[fn] + this._delimit + v : v
                    })
                    return d
                })
                if (this.field.callback) {
                    this.field.callback({matrix:this.matrix, records:this.records})
                }
            }, 2000),

            change(val){
                this.$emit('input', val)
            },
        },
        computed: {
            fieldItems(){
                return this.field.items.map((a) => {
                    if (typeof a == 'string') {
                        return {name: a, label: a}
                    }
                    return a
                })
            },
            fieldNames(){
                return this.fieldItems.map((a) => a.label || a.name)
            },
            lines () {
                let s = this.currentValue.trim()
                return s.length>0 && s.split('\n') || []
            },
            contentSample(){
                return this.fieldNames.join(this._delimit || ',')
            },
            _delimit (){
                return this.delimit || (this.lines.length>0 && this.guessDelimit(this.lines[0])) || ','
            }
        },
        watch: {
            'value'(val, oldValue) {
                this.currentValue = val
            },
            currentValue () {
                this.$emit('change', this.currentValue)
                this.genRecords()
            },
//            delimit () {
//                this.genRecords()
//            }
        }
    }
</script>
<style scoped></style>
