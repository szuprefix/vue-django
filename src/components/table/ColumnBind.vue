<template>
    <data-table v-model="tableData" :fields="fields" :topActions="[]" :rowActions="[]"></data-table>
</template>
<script>
    import DataTable from './DataTable.vue'
    export default{
        props: {
            value: Object,
            choices: Array,
        },
        data () {
            return {
                tableData:[this.value]
            }
        },
        components: {DataTable},
//        created () {
//            console.log(this.choices)
//        },
        methods: {},
        computed: {
            fieldNames () {
                return Object.keys(this.value)
            },
            fields () {
                return this.fieldNames.map(fn => {
                    return {
                        name: fn,
                        label: fn,
                        choices: this.choices.map(c => {
                            if(typeof c === 'object'){
                                return c
                            }
                            return {value: c, display_name: c}
                        }),
                        widget:'select',
                        useFormWidget: true
                    }
                })
            }
        }
    }
</script>
<style scoped></style>
