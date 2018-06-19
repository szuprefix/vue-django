<template>
    <span>{{display}}</span>
</template>
<script>
    export default{
        props: {
            value: Object,
            prop:String,
            field: Object
        },
        computed:{
            display(){
                let a = this.field.choices.find(a => a.value == this.value[this.field.name])
                return a && a.display_name
            }
        }
    }
</script>
