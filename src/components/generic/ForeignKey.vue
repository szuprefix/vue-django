<template>
  <a :href="`#${url}`" v-if="hasLink">
    {{label}}
  </a>
  <span v-else>
        {{label}}
    </span>
</template>
<script>
    import {Register} from 'vue-django/src/utils/app_model'
    import ContentType from './ContentType'
    export default{
        props: {
            value: [String, Number],
            field: Object ,
            context: Object
        },
        created () {
        },
        computed: {
            labelFieldName  () {
                return this.field.labelField || 'object_name'
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
