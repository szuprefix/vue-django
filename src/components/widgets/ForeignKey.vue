<template>
    <a :href="`#/${field.model.replace('.','/')}/${value[field.name]}/`" v-if="hasLink">
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
            value: Object,
            field: Object ,
            context: Object
        },
        computed: {
            theValue(){
                let n = `${this.field.name}_name`
                return this.value[n] || this.value[this.field.name]
            },
            hasLink(){
                return Register.configs[this.field.model]
            }
        }
    }
</script>
