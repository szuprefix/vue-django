<template>
    <span>{{now}}</span>
</template>
<script>
    import {formatTime} from '../../utils/filters'
    export default{
        props: {
            value: Object,
            prop:String
        },
        computed:{
            now(){
                let s = this.value[this.prop]
//                console.log(s)
                return formatTime(new Date(s))
            }
        }
    }
</script>
