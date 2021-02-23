<template>
    <van-image :src="`${field.prefix}${value}`" round width="6rem" height="6rem" v-bind="[field]"></van-image>
</template>
<script>
    import { Image as VanImage } from 'vant'
    export default{
        props: {
            field: Object,
            value: String,
            context: Object
        },
        data () {
            return {}
        },
        components: {VanImage},
        methods: {},
        computed: {}
    }
</script>
