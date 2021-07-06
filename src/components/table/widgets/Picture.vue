<template>
    <el-image fit='fill' v-bind="[field, $attrs, $props]" :src="url"
              v-if="value[field.name]" style="cursor: pointer" @click="open"></el-image>
</template>
<script>
    export default{
        props: {
            value: String,
            field: Object,
            context: Object,
            proxy: {type: String, default: ''}
        },
        data () {
            return {}
        },
        components: {},
        methods: {
            isLink(a) {
                return typeof a === 'string' && (a.startsWith('http://') || a.startsWith('https://'))
            },
            open () {
                window.open(this.url, '_blank')
            }
        },
        computed: {
            theProxy () {
                return this.proxy || this.field.proxy || ''
            },
            rootPath () {
                return this.field.imageRoot || this.$store.state.party.settings.imageRoot || ''
            },
            url () {
                let url = this.value[this.field.name]
                if (!this.isLink(url)) {
                    url = `${this.rootPath}${url}`
                }
                if (this.theProxy) {
                    url = `${this.theProxy}${url}`
                }
//                console.log(url)
                return url
            }
        }
    }
</script>

