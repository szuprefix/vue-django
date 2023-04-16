<template>
    <div>
        <field readonly clickable v-bind="[field]" :value="text" @click="showPicker = true">
        </field>
        <popup v-model="showPicker" position="bottom" round @click.stop="prevent">
            <picker show-toolbar :columns="columns" ref="picker"
                    @change="onPopupChange" @cancel="showPicker = false" @confirm="onConfirm">
                <template #title>
                    <field v-model="search" placeholder="输入关键字搜索" style="width:60%"></field>
                </template>
            </picker>
        </popup>
    </div>
</template>
<script>
    import {Field, Popup, Picker} from 'vant'
    import {findIndex, groupBy, map, get} from 'lodash'
    import Qs from 'qs'
    const ALL = '==全部=='
    export default{
        props: {
            field: Object,
            value: [String, Number, Array],
            context: Object
        },
        data () {
            return {
                defaultIndex: [0],
                showPicker: false,
                options: [],
                text: this.value === null ? ALL : this.context[`${this.field.name}_name`],
                search: ''
            }
        },
        components: {Field, Popup, Picker},
        created () {
            this.load()
        },
        methods: {
            onPopupChange(picker, value, index) {
//                console.log('change', picker, value, index)
            },
            onConfirm(value, index) {
                this.defaultIndex = index
//                console.log(this.columns, index)
                let k = index.join('.children.')
                let o = get(this.columns, k)
                this.$emit('input', o.value)
                this.text = o.text === ALL ? this.columns[index[0]].text : o.text
                this.showPicker = false
            },
            load(){
                let model = this.field.model
                let qd = {
                    search: this.search,
                    ...this.field.queries
                }
                this.$http.get(`/${model.replace('.', '/')}/?${Qs.stringify(qd)}`).then(({data}) => {
                    this.options = data.results
                })
            },
            prevent(){

            },
            optionToColumn(v) {
                let text = v[this.field.textField] || v.name || v.title
                let value = v.id
                return {text, value}
            }
        },
        computed: {
            group () {
                return this.field.group
            },
            columns () {
                let g = this.field.group
                let rs
                if (g) {
                    let gs = groupBy(this.options, g)
                    rs = map(gs, (value, key) => {
                        let cs = value.map(a => this.optionToColumn(a))
                        if (this.field.showNull) {
                            let d = {text: ALL, value: cs.map(a => a.value)}
                            cs.unshift(d)
                        }
                        return {text: key, children: cs}
                    })
                } else {
                    rs = this.options.map(a => {
                        return this.optionToColumn(a)
                    })
                }
                if (this.field.showNull) {
                    let d = {text: ALL, children: [{text: ALL,value: null}]}
                    rs.unshift(d)
                }
//                console.log(rs)
                return rs
            },
//            defaultIndex () {
//                return findIndex(this.columns, a => a.id === this.value)
//            }
        },
        watch: {
            search(){
                this.load()
            },
            showPicker(v) {
                if(v) {
                    this.$nextTick(() => {
                        this.$refs.picker.setIndexes(this.defaultIndex)
                    })

                }
            }
        }
    }
</script>
