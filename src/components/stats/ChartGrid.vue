<template>
    <el-row>
        <el-col :sm="c.sm || 24" :md="c.md || 12" :xl="c.xl || 8" v-for="c in items" :key="c.name" v-loading="loading"
                :element-loading-text="loading">
           <template  v-if="chartData[c.name]">
               <data-table v-if="c.type === 'table'" :group="true" :value="genTableData(c)" :fields="c.fields" :options="Object.assign({maxHeight:500},c.options)"></data-table>
               <chart v-else :options="chartOptions[c.name]" :auto-resize="true"></chart>
           </template>
        </el-col>
    </el-row>
</template>
<script>
    import Qs from 'qs'
    import server_response from 'vue-django/src/mixins/server_response'
    import DataTable from 'vue-django/src/components/layout/table/DataTable.vue'
    import {zipObject} from 'lodash'
    let OPTIONS_TOOLBOX = {
        show: true,
        right: '5%',
        feature: {
            dataView: {show: true, title: '数据视图', readOnly: true},
        }
    }
    let COMMON_OPTIONS = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            }
        },
        toolbox: OPTIONS_TOOLBOX,
    }

    export default{
        mixins: [server_response],
        props: {
            period: Array,
            url: String,
            items: Array,
            base: String
        },
        data () {
            return {
                chartData: {}
            }
        },
        components: {DataTable},
        mounted() {
            this.loadTimeData(this.period)
        },
        methods: {
            genTableData(c){
                let fns = c.fields.map(f => f.name)
                let data=this.chartData[c.name].map((d) => zipObject(fns, d))
//                console.log(data)
                return data
            },
            genDailyOption(item, data){
                return Object.assign({}, COMMON_OPTIONS, {
                    title: {
                        text: item.title
                    },
                    visualMap: item.visualMap,
                    xAxis: {
                        type: 'category',
                        data: data.map((a) => a[0])
                    },
                    yAxis: {
                        type: 'value',
                    },
                    series: [{
                        type: 'line',
                        smooth: true,
                        name: item.title,
                        data: data.map((a) => a[1])
                    }]
                })
            },
            genTreeMapOption(item, data){

            },
            genBarOption(item, data){
                let dataZoom = []
                if (data.length >= 16) {
                    dataZoom.push(
                        {
                            id: 'dataZoomY',
                            type: 'slider',
                            yAxisIndex: [0],
                            filterMode: 'filter',
                            show: true,
                            start: 0,
                            end: 900 / data.length
                        })
                }
                return Object.assign({}, COMMON_OPTIONS, {
                    title: {
                        text: item.title
                    },
                    dataZoom,
                    yAxis: {
                        type: 'category',
                        data: data.map((a) => a[0])
                    },
                    grid: {
                        left: '33%',
                    },
                    xAxis: {
                        position: 'top',
                        type: 'value',
                    },
                    series: [{
                        type: 'bar',
                        smooth: true,
                        name: item.title,
                        data: data.map((a) => a[1])
                    }]
                })
            },
            loadTimeData(period){
                let context = {measures: this.items.map((a) => a.name), period: `${period[0]}至${period[1]}`}
                let qs = Qs.stringify(context, {indices: false})
                this.loading = "加载中"
                this.$http.get(`${this.url}?${qs}`).then(({data}) => {
                    this.loading = false
                    let ds = data
                    if (this.base) {
                        ds = ds[this.base]
                    }
                    this.chartData = Object.assign({}, ds)
                }).catch(this.onServerResponseError)
            },
        },
        computed: {
            chartOptions(){
                let res = {}
                this.items.forEach((a) => {
                    let optionFunc = a.type == 'daily' ? this.genDailyOption : this.genBarOption
                    res[a.name] = optionFunc(a, this.chartData[a.name])
                })
                return res
            }
        },
        watch: {
            period(val){
                this.loadTimeData(val)
            }
        }
    }
</script>
