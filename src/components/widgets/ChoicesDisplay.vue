<template>
    <span>{{display}}</span>
</template>
<script>
    export default{
        props: {
            value: [String, Number],
            field: Object
        },
        computed:{
            display(){
                let a = this.field.choices.find(a => a.value == this.value)
                return a && a.display_name
            }
        }
    }
</script>
