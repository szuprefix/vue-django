<template>
    <form-widget v-if="field.useFormWidget" v-model="value" v-bind="[$attrs,$props]"></form-widget>
    <component :is="field.widget" v-model="value" v-bind="[$attrs,$props]"
               v-else-if="field.widget && typeof field.widget == 'object'"></component>
    <span v-else-if="field.widget && typeof field.widget == 'function'"
          v-html="field.widget(value, field)"></span>
    <span v-else>{{value[field.name]}}</span>
</template>
<script>
    import FormWidget from '../form/Widget.vue'
    export default{
        props: {
            field: Object,
            value: Object,
            context: Object
        },
        data () {
            return {}
        },
        components: {FormWidget},
        methods: {},
        computed: {}
    }
</script>
