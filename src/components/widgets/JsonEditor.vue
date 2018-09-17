<template>
  <div class="json-editor">
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
import 'codemirror/addon/lint/json-lint'

export default {
  name: 'jsonEditor',
  data() {
    return {
      jsonEditor: false
    }
  },
  props: {
      value: {
        type: Object,
        default: {}
      },
      field: Object,
      defaultValue : [String, Object, Array]
  },
  computed: {
    valueStr() {
      return JSON.stringify(this.value, null, 4)
    }
  },
  watch: {
    valueStr(value) {
      const editor_value = this.jsonEditor.getValue()
      if (value !== editor_value) {
        this.jsonEditor.setValue(JSON.stringify(this.value, null, 4))
      }
    }
  },
  mounted() {
    this.jsonEditor = CodeMirror.fromTextArea(this.$refs.textarea, {
      lineNumbers: true,
      mode: 'application/json',
      gutters: ['CodeMirror-lint-markers'],
      theme: 'ambiance',
      lint: true
    })

    this.jsonEditor.setValue(this.valueStr)

    this.jsonEditor.on('change', cm => {
      this.$emit('change', JSON.parse(cm.getValue()))
      this.$emit("input", JSON.parse(cm.getValue()))
    })
  },
  methods: {
    getValue() {
      return this.jsonEditor.getValue()
    }
  }
}
</script>

<style scoped>
.json-editor{
  height: 100%;
  position: relative;
}
.json-editor >>> .CodeMirror {
  height: auto;
  min-height: 300px;
}
.json-editor >>> .CodeMirror-scroll{
  min-height: 300px;
}
.json-editor >>> .cm-s-rubyblue span.cm-string {
  color: #F08047;
}
</style>
