<template>
    <el-row :gutter="10">
        <el-col :span="18">
        <el-input type="textarea" :rows="1" placeholder="请粘贴图片Url地址,多张以换行分隔。或者点击以下'+'按钮上传图片文件。" v-bind="[$attrs]"  v-model="urls">

        </el-input></el-col>
        <el-col :span="4" v-if="$attrs.plugin">
            <el-popover
                    v-model="togglePlugin"
                    width="500"
                    trigger="click">
                <el-button slot="reference" icon="el-icon-search"></el-button>
                <component :is="$attrs.plugin" @new="newUrls" v-if="togglePlugin"></component>
            </el-popover>
        </el-col>
    </el-row>
</template>
<script>
    import {uniq} from 'lodash'
    export default{
        data () {
            return {
                urls: '',
                togglePlugin:false
            }
        },
        components: {},
        methods: {
            newUrls(urls){
                this.$emit('new', urls)
            }
        },
        computed: {},
        watch: {
            urls(v) {
                let rs = []
                v.split('\n').forEach(l => {
                    let url = l.trim()
                    let b = url.startsWith('http://') || url.startsWith('https://')
                    if (b) {
                        rs.push(url)
                    }
                })
                rs = uniq(rs)
                if (rs.length > 0) {
                    this.newUrls(rs)
                    this.urls = ''
                }
            }
        }
    }
</script>
