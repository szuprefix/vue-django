<template>
        <div>
            <el-image :src="url" style="max-width: 98px;cursor: pointer" :lazy="i>0" :preview-src-list="pictures"
                      v-for="(url, i) in previewList" :key="url" :initial-index="initialIndex">
            </el-image>
            <span style="text-align: center;">{{pictures.length}}张</span>
        </div>

</template>
<script>
    import {get} from 'lodash'
    export default{
        props: {
            value: [String, Object],
            field: Object,
            context: Object
        },
        data () {
            return {}
        },
        components: {},
        methods: {
            open (url) {
                window.open(url, '_blank')
            }
        },
        computed: {
            initialIndexField() {
                return this.field.initialIndexField
            },
            pictures() {
                return get(this.context, this.field.name)
            },
            previewList() {
                let c = this.field.count || this.pictures.length
                if(c ===1 && this.initialIndexField) {
                    return this.pictures.slice(this.initialIndex, this.initialIndex+1)
                }
                return this.pictures.slice(0, c)
            },
            initialIndex() {
                let i = get(this.context, this.initialIndexField)
                if(i === undefined){
                    i = 0
                } else {
                    if(typeof i === 'string'){
                        return this.pictures.findIndex(a => a===i)
                    }
                }
                return i
            }
        }
    }
</script>

