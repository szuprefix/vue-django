<template>
   <el-avatar :src="url" v-if="fieldValue"></el-avatar>
</template>
<script>
   import {get} from 'lodash'
    export default{
        props: {
            value: String,
            field: Object,
            context: Object,
            proxy: {type:String, default: ''}
        },
        data () {
            return {}
        },
        components: {},
        methods: {},
        computed: {
            theProxy () {
                return this.proxy || this.field.proxy || ''
            },
            fieldValue () {
                return get(this.value,this.field.name)
            },
            url () {
                return `${this.theProxy}${this.fieldValue}`
            }
        }
    }
</script>

