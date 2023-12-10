<template>
    <el-tabs tab-position="right" type="card" class="tabs" v-model="tab">
        <el-tab-pane v-for="(gl, gn) in groups" :key="gn" :label="gn" lazy class="card">
            <template v-for="p in gl">
                <el-image :src="p[urlField]" :key="p[urlField]" fit="cover" class="picture"
                          @click="$emit('pick', p)" lazy></el-image>
            </template>
        </el-tab-pane>
    </el-tabs>
</template>
<script>
    import {groupBy} from 'lodash'
    export default{
        props: {
            list: Array,
            keyField: String,
            urlField:String,

        },
        data () {
            return {
                tab: null
            }
        },
        components: {},
        methods: {},
        computed: {
            groups() {
                return groupBy(this.list,  this.keyField)
            }
        }
    }
</script>

<style scoped>
    .card {
        height: 100%;
        overflow-y: scroll;
    }

    .tabs {
        height: 90%;
        overflow-y: scroll;
    }

    .picture {
        max-width: 100px;
        max-height: 100px;
        cursor: pointer;
        border-radius: 5px;
        margin-right: 1px;
    }
</style>
