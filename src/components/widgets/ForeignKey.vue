<template>
    <router-link :to="{path:url}" title="点击跳转"
       class="foreignkey-link" v-if="hasLink">
        {{theValue}}
    </router-link>
    <span v-else>
        {{theValue}}
    </span>
</template>
<script>
    import RouterLink from 'vue-router'
    import {Register} from 'vue-django/src/utils/app_model'
    export default{
        props: {
            value: Object,
            field: Object,
            context: Object
        },
        computed: {
            theValue(){
                let n = `${this.field.name}_name`
                let s = this.value[n] || this.value[this.field.name]
                if(this.field.labelFormat) {
                    s = this.field.labelFormat(s)
                }
                return s
            },
            hasLink(){
                return Register.configs[this.field.model]
            },
            url() {
                let f = this.field
                return `/${f.model.replace('.', '/')}/${this.value[f.keyField || f.name]}/`
//                if (this.$router.mode !== 'history') {
//                    l = '#'.concat(l)
//                }
//                return l
            }
        }
    }
</script>
<style>
    a.foreignkey-link:hover {
        text-decoration: underline;
        color: blue;
    }
</style>
