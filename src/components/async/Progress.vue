<template>
    <div>
        <el-timeline :reverse="$attrs.reverse">
            <el-timeline-item
                    v-for="(m, i) in messages"
                    :key="i"
                    :timestamp="m.timestamp">
               {{m.status}} {{m.text}}
            </el-timeline-item>
        </el-timeline>
    </div>
</template>
<script>
    import progress from './progress'
    import {parseTime} from '../../utils/filters'
    export default{
        props: {
            task: Object
        },
        data () {
            return {
                messages: []
            }
        },
        components: {},
        created () {
            progress(this.task, {progress: this.onProgress}).then((rs) => {
                this.$emit('done', rs)
            })
        },
        methods: {
            onProgress(m) {
                this.messages.push({...m, timestamp: parseTime(new Date(), '{h}:{i}:{s}')})
            }
        },
        computed: {}
    }
</script>
