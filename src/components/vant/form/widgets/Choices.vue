<template>
    <div slot="input" @click="showPicker = true">
        {{text}}
        <popup v-model="showPicker" position="bottom" @click.stop="prevent">
            <picker show-toolbar :columns="columns" @cancel="showPicker = false"
                    @confirm="onConfirm">
            </picker>
        </popup>
    </div>
</template>
<script>
    import {Field, Popup, Picker} from 'vant'
    export default{
        props: {
            field: Object,
            value: [Number,String],
            context: Object
        },
        data () {
            return {
                showPicker: false,
                text: '',
            }
        },
        components: {Field, Popup, Picker},
        methods: {
            onConfirm(value, index) {
                this.$emit(this.field.choices[index].value)
                this.text = value
                this.showPicker = false
            },
            prevent(){

            }
        },
        computed: {
            columns () {
                return this.field.choices.map(a => a.display_name)
            }
        }
    }
</script>
