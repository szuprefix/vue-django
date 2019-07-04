<template>
  <span :contenteditable="editable" @dblclick="toEdit" @blur="changed" class="xyz-editable-span">
  </span>
</template>
<script>
    export default{
        props: {
            value: String,
        },
        data () {
            return {
                editable: false
            }
        },
        components: {},
        mounted() {
            this.setValue(this.value)
        },
        methods: {
            setValue(v){
                this.$el.innerText = v
                console.log(v)
            },
            changed(){
                let v = this.$el.innerText
                this.$emit('change', v)
                this.editable = false
            },
            toEdit() {
                this.editable = true
                this.$el.focus()
            }
        },
        computed: {},
        watch: {
            value(val){
                this.setValue(val)
            }
        }
    }
</script>
<style>
    .xyz-editable-span {
        display: inline-block;
        min-width: 4rem;
    }
</style>
