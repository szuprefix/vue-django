<template>
    <el-form-item :prop="field.name" :rules="field.rules" :label="field.label" :error="error"
                  :ref="field.name"
                  :style="options.noLabel && {} || options.itemStyle || {minWidth: '350px'}">
        <template slot="label" v-if="!options.noLabel">
            {{field.label}}
            <el-tooltip placement="top" v-if="field.help_text">
                <div slot="content" v-html="field.help_text"></div>
                <i class="fa fa-info-circle bg-info"></i>
            </el-tooltip>
        </template>
        <template slot="label" v-else><span></span></template>
        <template>
            <widget v-model="value" :field="field"></widget>
        </template>
    </el-form-item>
</template>
<script>
    import Widget from './Widget.vue'
    export default{
        props: {
            field: Object,
            value: Object,
            options: {
                type: Object,
                default: () => {
                    return {}
                }
            },
            error: String
        },
        data () {
            return {}
        },
        components: {
            Widget,
        },
        methods: {},
        computed: {}
    }
</script>

