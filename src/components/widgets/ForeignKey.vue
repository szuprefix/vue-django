<template>
    <a :href="`#/${field.model.replace('.','/')}/${value[prop]}/`" v-if="hasLink">
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
            field: Object,
            prop: String
        },
        computed: {
            theValue(){
                let n = `${this.prop}_name`
                return this.value[n] || this.value[this.prop]
            },
            hasLink(){
                return Register.configs[this.field.model]
            }
        }
    }
</script>
