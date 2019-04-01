<template>
    <i class="fa fa-cross" v-if="!value[prop]"></i>
</template>
<script>
    export default{
        props: {
            value: Object,
            prop:String
        }
    }
</script>
