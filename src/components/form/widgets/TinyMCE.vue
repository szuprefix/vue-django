<template>
    <textarea @change="onChange" v-model="html" class="tinymce-editor">
    </textarea>
</template>
<script>
    import $script from 'scriptjs'
    export default{
        props: {
            value: String,
            field: Object
        },
        data () {
            return {
                html: this.value
            }
        },
        components: {},
        mounted () {
            this.init()
        },
        methods: {
            init () {
                if (!window.tinymce) {
                    $script([
                        `//cdn.tiny.cloud/1/${this.field.apiKey || 'no-api-key'}/tinymce/5/tinymce.min.js`,
                    ], () => {
                        this.createEditor()
                    })
                } else {
                    this.createEditor()
                }
            },
            createEditor() {
                console.log('createEditor')
                tinymce.init({
                    selector: '.tinymce-editor',
                    plugins: 'a11ychecker advcode casechange export formatpainter linkchecker autolink lists checklist media mediaembed pageembed permanentpen powerpaste table advtable tinycomments tinymcespellchecker',
                    toolbar: 'a11ycheck addcomment showcomments casechange checklist code export formatpainter pageembed permanentpen table',
                    toolbar_mode: 'floating',
                    tinycomments_mode: 'embedded',
                    tinycomments_author: 'Author name',
                })
                console.log('createEditor done')
            },
            onChange() {
                this.$emit('input', this.html)
            }
        },
        computed: {}
    }
</script>
