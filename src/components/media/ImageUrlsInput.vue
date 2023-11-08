<template>
    <el-input type="textarea" :rows="1" placeholder="请粘贴图片Url地址,多张以换行分隔。或者点击以下'+'按钮上传图片文件。" v-bind="[$attrs]" v-model="urls"></el-input>
</template>
<script>
    import {uniq} from 'lodash'
    export default{
        data () {
            return {
                urls: ''
            }
        },
        components: {},
        methods: {},
        computed: {},
        watch: {
            urls(v) {
                let rs = []
                v.split('\n').forEach(l => {
                    let url = l.trim()
                    let b = url.startsWith('http://') || url.startsWith('https://')
                    if(b){
                        rs.push(url)
                    }
                })
                rs = uniq(rs)
                if(rs.length>0) {
                    this.$emit('new', rs)
                    this.urls = ''
                }
            }
        }
    }
</script>
