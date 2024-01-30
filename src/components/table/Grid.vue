<template>
    <el-row>
        <el-col :span="span" v-for="row in value" :key="row.id">
            <el-card :body-style="{padding: '0px' }">
                <template v-for="f in items">
                   <widget :field="f" :value.sync="row" :key="f.name">
                    </widget>
                </template>
            </el-card>
        </el-col>
    </el-row>
</template>
<script>
    import Widget from './Widget.vue'
    export default{
        props: {
            value: Array,
            items: Array,
            span: {type: Number, default: 8}
        },
        data () {
            return {}
        },
        components: {
            Widget
        },
        methods: {},
        computed: {}
    }
</script>
