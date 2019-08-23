<template>
    <i class="fa fa-cross" v-if="!value"></i>
</template>
<script>
    export default{
        props: {
            value: Object,
            field: Object
        }
    }
</script>
