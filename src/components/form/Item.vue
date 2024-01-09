<script setup>
    import Widget from './Widget.vue'
    import { useAttrs, computed, onMounted } from 'vue'
    const props = defineProps({
        field: Object,
        value: Object,
        options: {
            type: Object,
            default: () => {
                return {}
            }
        },
        error: String
    })
    const attrs = useAttrs()
    const noLabel = computed(() =>{
        return attrs.noLabel || props.field.noLabel
    })
    console.log(props.field.name)
</script>
<template>
    <el-form-item :prop="field.name" v-bind="[field, $attrs]" :error="error" :ref="field.name"
                  :style="noLabel && {} || $attrs.itemStyle || {minWidth: '350px'}">
        <template slot="label" v-if="!noLabel">
            {{field.label}}
            <el-tooltip placement="top" v-if="field.help_text">
                <div slot="content" v-html="field.help_text"></div>
                <i class="fa fa-info-circle bg-info"></i>
            </el-tooltip>
        </template>
        <template slot="label" v-else><span></span></template>
        <template>
            <widget v-bind="pros" @update="v => $emit('update', v)"></widget>
        </template>
    </el-form-item>
</template>

