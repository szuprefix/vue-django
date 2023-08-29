<template>
    <el-popover>
        <div slot="reference" style="">
            <el-image :src="pictures[0]" style="max-width: 98px;cursor: pointer" lazy>
            </el-image>
            <span style="text-align: center;">{{pictures.length}}张</span>
        </div>
        <el-row>
            <el-col v-for="p in pictures" :key="p" :sm="6" :md="4" :lg="3" :xl="2">
                <el-image :src="p"  @click="open(p)" style="cursor: pointer"></el-image>
            </el-col>
        </el-row>

    </el-popover>
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
            pictures() {
                return get(this.context, this.field.name)
            }
        }
    }
</script>

