<template>
    <div v-loading="loading" :element-loading-text="loading">
        <extractor v-model="sheet" :binding="binding"></extractor>
        <batch-creator :structure="_structure" :value="sheet.data" :appModelName="_structure.name"
                       @optionLoaded="onOptionLoaded" ref="creator"></batch-creator>
    </div>
</template>
<script>
    import Extractor from '../sheets/Extractor.vue'
    import BatchCreator from './BatchCreator.vue'
    export default{
        props:{
            structure: Object
        },
        data () {
            return {
                _structure:{},
                loading: false,
                binding: [],
                sheet: {data: [], fields: [], name: ''}
            }
        },
        created() {
           this._structure= Object.assign({}, this.structure)
        },
        components: {Extractor, BatchCreator},
        methods: {
            onOptionLoaded(context){
                this.binding = context.structure.tableItems
                console.log(this.binding)
                this._structure = Object.assign(this.structure, context.structure)
            },
            checkExist(){
                this.loading = '正在过滤已存在记录...'
                this.$refs.creator.checkExistsRecur().then((newRecords) => {
                    this.loading = false
                })
            },
            saveRecords(){
                this.$refs.creator.saveRecords()
            }
        },
        computed: {},
        watch: {
            sheet(val){
                setTimeout( this.checkExist, 100)
            }
        }
    }
</script>
<style scoped></style>
