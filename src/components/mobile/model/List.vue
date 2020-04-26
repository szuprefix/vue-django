<template>
    <div v-infinite-scroll="loadMore" infinite-scroll-disabled="$attrs.infiniteScrollDisabled || loading"
         infinite-scroll-distance="10">
        <panel v-bind="[$attrs,$props]" v-model="data" v-if="layout === 'panel'"></panel>
        <cells v-bind="[$attrs,$props]" v-model="data" v-if="layout === 'cells'">
            <template slot="icon" v-if="$scopedSlots.icon" slot-scope="scope">
                <slot name="icon" v-bind="scope"></slot>
            </template>
        </cells>

        <load-more :tip="tip" :show-loading="loading" v-if="pageSize < count"></load-more>
        <div v-if="!loading && count<=0" style="text-align: center;margin: 2rem 0;">暂无数据</div>
    </div>
</template>
<script>
    import {LoadMore, InlineLoading} from 'vux'
    import Panel from './Panel.vue'
    import Cells from './Cells.vue'
    import {Register} from '../../../utils/app_model'
    export default{
        props: {
            appModel: String,
            owner: Object,
            queries: {type: Object, default: {}},
            layout: {type: String, default: 'panel'},
            prepare: Function
        },
        data () {
            return {
                loading: false,
                data: [],
                count: 0,
                pageSize: 20,
                model: Register.get(this.appModel)
            }
        },
        components: {Panel, Cells, LoadMore, InlineLoading},
        created () {
            this.load()
        },
        methods: {
            load () {
                let qd = {...this.queries, page_size: this.pageSize}
                if (this.owner) {
                    qd.owner_type = this.owner.options.content_type_id
                    qd.owner_id = this.owner.id
                }
                this.loading = true
                return this.model.query(qd).then(data => {
                    this.loading = false
                    this.count = data.count
                    let ds = data.results
                    if (this.prepare) {
                        ds = this.prepare(ds)
                    }
                    this.data = ds
                })
            },
            loadMore (loaded) {
                if (this.pageSize < this.count) {
                    this.pageSize += 10
                }
            }
        },
        computed: {
            tip () {
                return this.pageSize < this.count ? '加载中' : '没有了'
            }
        },
        watch: {
            queries (v) {
                this.load()
            },
            pageSize (v) {
                this.load()
            },
            owner (v) {
                this.load()
            }
        }
    }
</script>
