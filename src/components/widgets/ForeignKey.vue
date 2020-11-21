<template>
    <a :href="`#/${field.model.replace('.','/')}/${value[field.name]}/`" title="点击跳转" class="foreignkey-link" v-if="hasLink">
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
<style>
    a.foreignkey-link:hover{
        text-decoration: underline;
        color:blue;
    }
</style>
