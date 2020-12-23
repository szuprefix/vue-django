<template>
    <div>
        <field readonly clickable v-bind="[field]" :value="text" @click="showPicker = true">
        </field>
        <popup v-model="showPicker" position="bottom" @click.stop="prevent">
            <picker show-toolbar :columns="columns" :defaultIndex="defaultIndex"
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
    import {findIndex} from 'lodash'
    export default{
        props: {
            field: Object,
            value: [String, Number],
            context: Object
        },
        data () {
            return {
                showPicker: false,
                options: [],
                text: this.context[`${this.field.name}_name`],
                search: ''
            }
        },
        components: {Field, Popup, Picker},
        created () {
            this.load()
        },
        methods: {
            onPopupChange(picker, value, index) {

            },
            onConfirm(value, index) {
                let v = this.options[index].id
//                console.log(v)
                this.$emit('input', v)
                this.text = value
                this.showPicker = false
            },
            load(){
                let model = this.field.model
                this.$http.get(`/${model.replace('.', '/')}/?search=${this.search}`).then(({data}) => {
                    this.options = data.results
                })
            },
            prevent(){

            }
        },
        computed: {
            columns () {
                return this.options.map(a => a.name || a.title)
            },
            defaultIndex () {
                return findIndex(this.options, a => a.id === this.value)
            }
        },
        watch:{
            search(){
                this.load()
            }
        }
    }
</script>
