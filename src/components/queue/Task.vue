<template>
    <div>

        <el-tabs tab-position="right" style="height: 100%">
            <el-tab-pane :label="`${queue.length}`">
                <span slot="label"><i class="fa fa-list"></i> 等待队列<el-badge type="primary" :value="queue.length"
                                                                            v-if="queue.length>0"/></span>

                <div v-if="queue.length>0">
                    <div class="flex-right">
                        <el-button plain>总数:{{queue.length}}</el-button>
                        <el-button plain type="danger">异常:{{fail.length}}</el-button>
                        <el-button type="primary" size="small" @click="sumbit">开始</el-button>
                    </div>

                    <x-table v-model="queue" :items="items" :cellWidget="TableCell" row-key="keyField"></x-table>
                </div>
            </el-tab-pane>
            <el-tab-pane :label="`${success.length}`">
                <span slot="label"><i class="fa fa-check"></i> 成功记录<el-badge type="success" :value="success.length"
                                                                             v-if="success.length>0"/></span>

                <x-table v-model="success" :items="items" row-key="keyField"></x-table>
            </el-tab-pane>
            <el-tab-pane :label="`${fail.length}`">
                <span slot="label"><i class="fa fa-close"></i> 失败记录<el-badge :value="fail.length"
                                                                             v-if="fail.length>0"/></span>

                <div class="flex-right">
                    <el-button type="primary" size="small" @click="retry">再试一次</el-button>
                </div>
                <x-table v-model="fail" :items="items" row-key="keyField"></x-table>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>
<script>
    import queueLimit from '../../utils/async_queue'
    import serverResponse from '../../mixins/server_response'
    import XTable from '../table/Table.vue'
    import {keyBy, mapValues, pickBy} from 'lodash'
    export default{
        props: {
            items: Array,
            concurrence: {type: Number, default: 1},
            keyField: {type: String, default: 'id'},
            action: Function,
            onSuccess: Function,
            value: Array
        },
        data () {
            return {
                queue: [],
                success: [],
                fail: [],
                ids: {}
            }
        },
        components: {XTable},
        created () {
            this.queue = this.value
        },
        methods: {

            post(d){
                let id = d[this.keyField]
                this.ids[id] = true
                return this.action(d).then(result => {
                    let data = this.onSuccess && this.onSuccess(result) || result
                    this.success.push(data)
                }).catch((error) => {
                    if (!this.fail.find(a => a[this.keyField] === id)) {
                        this.fail.push(d)
                    }
                }).then(() => {
                    for (var i in this.queue) {
                        if (this.queue[i][this.keyField] === id) {
                            this.queue.splice(i,1)
                            console.log('delete', id)
                            return
                        }
                    }
                })
            },
            sumbit () {
                if (this.queue.length > 0) {
                    queueLimit(this.queue, this.concurrence, this.post).then(() => {
                        this.$message('执行完毕')
                        this.$emit('done', {success: this.success, fail: this.fail})
                    })
                }
            },
            retry(){
                this.queue = this.queue.concat(this.fail)
                this.sumbit()
            }
        },
        watch: {
            value () {
                this.queue = this.value
            }
        }
    }
</script>
