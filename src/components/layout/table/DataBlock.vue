<template>
    <div v-loading="loading" :element-loading-text="loading">
        <data-table v-model="value.data" :fields="setHeaderActions(value.fields)" :headerWidget="ActionLabel"
                    :cellWidget="EditableLabel" :options="{elTable:{border:true,minHeight:400,stripe:true}}">

        </data-table>
        <el-dialog title="合并字段" :visible.sync="showMerge">
            <el-checkbox-group  v-model="fieldList">
                <el-checkbox :label="f.label || f.name" v-for="f in value.fields" :key="f.name"></el-checkbox>
            </el-checkbox-group>

            <div slot="footer" class="dialog-footer">
                <el-button @click="showMerge = false">取 消</el-button>
                <el-button type="primary" @click="mergeColumn">合并</el-button>
            </div>
        </el-dialog>
    </div>

</template>
<script>
    import DataTable from './DataTable.vue'
    import ActionLabel from './ActionLabel.vue'
    import EditableLabel from '../../widgets/EditableLabel.vue'
    import {set, unset, uniqueId, pick} from 'lodash'
    export default{
        props: {
            value: Object
        },
        data () {
            return {
                loading: false,
                ActionLabel,
                EditableLabel,
                actions: [
                    {name: 'delete', label: '删除整列', do: this.deleteColumn},
                    {name: 'merge', label: '合并字段', do: () => this.showMerge = true },
                    {name: 'delete', label: '按分隔符拆分内容'},
                ],
                showMerge: false,
                fieldList : []
            }
        },
        components: {DataTable},
        methods: {
            setHeaderActions (fields){
                fields.forEach(f => {
                    f.label = f.label || f.name
                    f.actions = this.actions
                    f.headerChange = this.headerChange
                })
                return fields
            },
            headerChange ({context, newValue, oldValue}){
                let ds = this.value.data
                ds.forEach(d => {
                    d[newValue] = d[oldValue]
                    delete d[oldValue]
                })
                let f = this.value.fields.find(f => f.name === oldValue)
                f.name = f.label = newValue
            },
            mergeColumn(context){
                let fl =  this.fieldList
                if(fl.length<2){
                    this.$message({type:'info', message:'请选择至少两个字段'})
                    return
                }
                this.showMerge = false
                this.loading = '合并中...'
                let fs = this.value.fields
                let bf = fs.find(a => a.name === fl[0])
                let mfs = fs.filter(a => fl.slice(1).includes(a.name))

                let ds = this.value.data
                let ds2 = []
                let nfn = `mergeField${uniqueId()}`
                let nf = Object.assign({}, bf, {name:nfn, label:nfn})
                let cfs = fs.filter(f => !fl.includes(f.name))
                let cfns = cfs.map(f => f.name)
                ds.forEach(d => {
                    d[nfn] = bf.label
                    let bvs = pick(d, cfns)
                    mfs.forEach(f => {
                        let nd = Object.assign({}, bvs)
                        nd[nfn] = f.label
                        nd[bf.name] = d[f.name]
                        ds2.push(nd)
                    })
                })
                this.value.data = ds.concat(ds2)
                this.value.fields = cfs.concat([bf, nf])
                this.loading = false
            },
            deleteColumn(context){
                this.value.fields = this.value.fields.filter(a => a.name !== context.name)
            }
        },
        computed: {}
    }
</script>
<style></style>
