<template>
  <div class="sql-editor">
    <textarea ref="textarea"></textarea>
  </div>
</template>

<script>
import CodeMirror from 'codemirror'
import 'codemirror/addon/lint/lint.css'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/ambiance.css'
require('script-loader!jsonlint')
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/lint/lint'
import 'codemirror/addon/hint/sql-hint'

export default {
  name: 'SqlInput',
  data() {
    return {
      sqlEditor: false
    }
  },
  props: {
      value: String,
      field: Object
  },
  watch: {
    value(value) {
      const editor_value = this.sqlEditor.getValue()
      if (value !== editor_value) {
        this.sqlEditor.setValue(this.value)
      }
    }
  },
  mounted() {
    this.sqlEditor = CodeMirror.fromTextArea(this.$refs.textarea, {
      lineNumbers: true,
      mode: 'text/x-mysql',
      gutters: ['CodeMirror-lint-markers'],
      theme: 'ambiance',
      lint: true
    })

    this.sqlEditor.setValue(this.value)

    this.sqlEditor.on('change', cm => {
      this.$emit('changed', cm.getValue())
    })

    this.sqlEditor.on('blur', cm => {
      this.$emit('blur', cm.getCursor())
    })
  },
  methods: {
    getValue() {
      return this.sqlEditor.getValue()
    },

    insertString(str, pos) {
      this.sqlEditor.replaceSelection(str)
      this.sqlEditor.focus()
      pos.ch += str.length
      this.sqlEditor.setCursor(pos)
    }
  }
}
</script>

<style scoped>
.sql-editor{
  height: 100%;
  position: relative;
}
.sql-editor >>> .CodeMirror {
  height: auto;
  min-height: 300px;
}
.sql-editor >>> .CodeMirror-scroll{
  min-height: 300px;
}
</style>
