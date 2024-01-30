<template>
    <el-image fit='fill' v-bind="[field, $attrs, $props]" :src="url"
              v-if="url" style="cursor: pointer" @click="open" v-loading="loading" @error="tryProxy=true">
        <div slot="error" class="image-error"  @click="open">
            <i class="el-icon-picture-outline"></i>
        </div>
        <div slot="placeholder" @click="open">
            <i class="el-icon-loading"></i>
        </div>
    </el-image>
</template>
<script>
    import {get} from 'lodash'
    export default{
        props: {
            value: String,
            field: Object,
            context: Object,
            proxy: {type: String, default: ''}
        },
        data () {
            return {
                loading: false,
                tryProxy: false
            }
        },
        components: {},
        methods: {
            isLink(a) {
                return typeof a === 'string' && (a.startsWith('http://') || a.startsWith('https://'))
            },
            async open () {
                let url = null
                if(this.field.openUrl) {
                    url = this.field.openUrl(this.context)
                }
                if(url instanceof Promise){
                    this.loading = true
                    url = await url
                    this.loading = false
                }
                if(!url) {
                    url = this.url
                }
                window.open(url, '_blank')
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
                let d = this.context || this.value
                let url = get(d,this.field.name)
                if (this.field.formatter) {
                    url = this.field.formatter(this.value, this.field.name, url)
                }
                if (!this.isLink(url)) {
                    url = `${this.rootPath}${url}`
                }
                if (url && this.theProxy && this.tryProxy) {
                    url = `${this.theProxy}${url}`
                }
                return url
            }
        }
    }
</script>

