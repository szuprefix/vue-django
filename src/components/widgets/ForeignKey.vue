<template>
    <a :href="`#/${field.model.replace('.','/')}/${value}/`" v-if="hasLink">
        {{theValue}}
    </a>
    <span v-else>
        {{theValue}}
    </span>
</template>
<script>
    import {Register} from 'vue-django/src/utils/app_model'
    export default{
        props: {
            value: [String, Number],
            field: Object ,
            context: Object
        },
        computed: {
            theValue(){
                let n = `${this.field.name}_name`
                return this.context[n] || this.value
            },
            hasLink(){
                return Register.configs[this.field.model]
            }
        }
    }
</script>
