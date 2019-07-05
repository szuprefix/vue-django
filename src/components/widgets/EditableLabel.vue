<template>
  <span :contenteditable="editable" @dblclick="toEdit" @blur="changed" class="xyz-editable-span">
  </span>
</template>
<script>
    function setCaretPosition(textDom, pos){
        if(textDom.setSelectionRange) {
            // IE Support
            textDom.focus();
            textDom.setSelectionRange(pos, pos);
        }else if (textDom.createTextRange) {
            // Firefox support
            var range = textDom.createTextRange();
            range.collapse(true);
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
        }
    }

    export default{
        props: {
            value: [String, Number],
            field: {
                type: Object, default: () => {
                    return {}
                }
            }
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
            },
            changed(){
                let v = this.$el.innerText
                let t = this.field.type
                if (t === 'integer') {
                    v = Number.parseInt(v)
                } else if (['number','decimal','float'].includes(t)) {
                    v = Number.parseFloat(v)
                }
                this.$emit('input', v)
                this.editable = false
            },
            toEdit() {
                this.editable = true
                setTimeout( () => {
                    this.$el.focus()
//                    let l = this.value && this.value.length || 0
//                    setCaretPosition(this.$el,l)
                }, 50)
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
