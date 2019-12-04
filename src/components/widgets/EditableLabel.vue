<template>
  <span :contenteditable="editable" @dblclick.stop="toEdit" @keyup="onInput" @focus="onFocus" @blur="checkChanged"
        class="xyz-editable-span">
  </span>
</template>
<script>
    function setCaretPosition(textDom, pos) {
        if (textDom.setSelectionRange) {
            // IE Support
            textDom.focus();
            textDom.setSelectionRange(pos, pos);
        } else if (textDom.createTextRange) {
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
            },
            always: false
        },
        data () {
            return {
                _value: undefined,
                lastValue: undefined,
                editable: this.always || this.field.alwaysEditable
            }
        },
        components: {},
        mounted() {
            this.$el.innerText = this._value = this.formatValue(this.value)
        },
        methods: {
            onInput () {
                let v = this.parseValue(this.$el.innerText)
                let t = this.formatValue(v)
                if (t !== this.$el.innerText) {
                    this.$el.innerText = t
                }

                this.$emit('input', v)
            },
            formatValue (v) {
                return [undefined, null].includes(v) ? '' : String(v)
            },
//            setValue(v){
//                this._value = this.formatValue(v)
////                if (this.$el.innerText !== v) {
////                    this.lastValue = this.$el.innerText = v
////                }
//            },
            parseValue (v) {
                let t = this.field.type
                if (t === 'integer') {
                    v = v !== undefined && Number.parseInt(v) || undefined
                } else if (['number', 'decimal', 'float'].includes(t)) {
                    v = v !== undefined && Number.parseFloat(v) || undefined
                }
                return v
            },
            onFocus () {
                this.lastValue = this._value
            },
            checkChanged () {
                if (this.lastValue !== this._value) {
                    this.changed()
                }
            },
            changed(){
                let v = this.parseValue(this._value)
                this.$emit('change', v)
                this.editable = this.always || this.field.alwaysEditable
            },
            toEdit() {
                if (!this.editable) {
                    this.editable = true
                    setTimeout(() => {
                        this.$el.focus()
//                    let l = this.value && this.value.length || 0
//                    setCaretPosition(this.$el,l)
                    }, 50)
                }
            }
        },
        computed: {},
        watch: {
            value(val){
                this._value = this.formatValue(val)
            },
            _value(val) {
                this.$el.innerText = val
                this.$emit('change', this.parseValue(val))
            }
        }
    }
</script>
<style>
    .xyz-editable-span {
        display: inline-block;
        min-width: 6rem;
    }
  .integer .xyz-editable-span {
    min-width: 2rem;
  }
</style>
