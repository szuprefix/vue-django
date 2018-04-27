<template>
    <span>{{value[prop]|date2now}}</span>
</template>
<script>
    import {date2now} from '../../utils/filters'
    export default{
        props: {
            value: Object,
            prop:String
        },
        modelTableFilters:{
            date2now
        }
    }
</script>
