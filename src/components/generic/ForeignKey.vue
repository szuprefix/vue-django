<template>
    <a :href="`#${url}`" title="点击跳转" class="foreignkey-link" v-if="hasLink">
        {{label}}({{this.model.config.verbose_name}})
    </a>
    <span v-else>
        {{label}}
    </span>
</template>
<script>
    import {Register} from 'vue-django/src/utils/app_model'
    import ContentType from './ContentType'
    ContentType.loadIdMap()
    export default{
        props: {
            value: [String, Number],
            field: Object,
            context: Object
        },
        created () {
//            console.log(this.model)
        },
        computed: {
            labelFieldName  () {
                return this.field.labelField || this.field.name
            },
            label(){
                return this.context[this.labelFieldName]
            },
            contentTypeIdField () {
                return this.field.contentTypeIdField || 'content_type'
            },
            contentTypeId () {
                return this.context[this.contentTypeIdField]
            },
            objectIdField () {
                return this.field.objectIdField || 'object_id'
            },
            objectId () {
                return this.context[this.objectIdField]
            },
            model () {
                return ContentType.getAppModel(this.contentTypeId)
            },
            url () {
                return this.model.getDetailUrl(this.objectId)
            },
            hasLink(){
                return this.model
            }
        }
    }
</script>
