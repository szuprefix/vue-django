<template>
    <div>
        <csv-input v-model="value" :field="{name:'content', type:'string', items: fields, callback:change}" ></csv-input>
    </div>
</template>
<script>
    import BatchCreator from '../../utils/batch_creator'
    import CsvInput from '../widgets/CsvInput.vue'
    export default{
        props :{
           structure: Object
        },
        data () {
            return {
                fields: [],
                value: '',
                records: []
            }
        },
        components: {CsvInput},
        created () {
            let struct = BatchCreator.getStructure(this.structure)
            BatchCreator.batchLoadOptions(struct.getModelNames()).then((r)=> {
                 this.fields = struct.getTableItems()
            })

//
//            let struct = {models:BatchCreator.getModels(this.structure)}
//            BatchCreator.batchLoadOptions(struct.models).then((r)=> {
//                struct.fields = this.fields = BatchCreator.getFields(this.structure)
//
////                console.log(BatchCreator.groupByModel(this.fields))
//                this.$emit('struct', struct)
////                console.log(JSON.stringify(this.fields))
//            })
        },
        methods: {
            change(d) {
                this.records = d
//                console.log(d)
                this.$emit('change', d)
            }
        },
        computed: {}
    }
</script>
<style scoped></style>
