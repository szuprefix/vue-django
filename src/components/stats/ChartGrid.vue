<template>
    <el-row>
        <el-col :sm="c.sm || c.span || 24" :md="c.md || c.span ||  12" :xl="c.xl || c.span || 8" v-for="c in items"
                :key="c.name" v-loading="loading"
                :element-loading-text="loading">
            <template v-if="chartData[c.name]">
                <template v-if="c.type === 'table'">
                    <h4>{{c.title}}</h4>
                    <data-table :title="c.title" :group="c.group" :value="genTableData(c)"
                                :items="c.fields"
                                :options="Object.assign({maxHeight:500},c.options)"></data-table>
                </template>
                <chart v-else :options="chartOptions[c.name]" :auto-resize="true"></chart>
            </template>
        </el-col>
    </el-row>
</template>
<script>
    import Qs from 'qs'
    import ServerResponse from '../../mixins/server_response'
    import DataTable from '../table/Table.vue'
    import arrayNormalise from '../../utils/array_normalize'
    import {zipObject} from 'lodash'
    import Vue from 'vue'
    import ECharts from 'vue-echarts' // refers to components/ECharts.vue in webpack
    import 'echarts/lib/chart/bar'
    import 'echarts/lib/chart/line'
    import 'echarts/lib/component/tooltip'
    import 'echarts/lib/component/visualMap'
    import 'echarts/lib/component/title'
    import 'echarts/lib/component/toolbox'
    import 'echarts/lib/component/dataZoom'

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
        mixins: [ServerResponse],
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
        components: {DataTable, 'chart': ECharts},
        created () {
//           import('echarts').then(echarts => {
//               console.log('echarts imported.')
//           })
        },
        mounted() {
            this.loadTimeData(this.period)
        },
        methods: {
            genTableData(c){
                let fns = c.fields.map(f => f.name)
                let data = this.chartData[c.name].map((d) => zipObject(fns, d))
//                console.log(data)
                return data
            },
            genDailyOption(item, data){
                item.fields = item.fields || ['日期', item.title]
                item.fields = arrayNormalise(item.fields, {})

                let series = [{
                    type: 'line',
                    smooth: true,
                    name: item.fields[1] && item.fields[1].name || '数量',
                }]
                let yAxis = [{
                    type: 'value',
                    name: item.fields[1].name
                }]
                if (item.fields.length >= 3) {
                    series.push({
                        type: 'bar',
                        yAxisIndex: 1,
                        name: item.fields[2] && item.fields[2].name || '数量2',
                    })
                    yAxis.push({
                        type: 'value',
                        name: item.fields[2] && item.fields[2].name
                    })
                }
                return {
                    visualMap: item.visualMap,
                    dataset: {
                        source: data
                    },
//                    title: item.title,
                    xAxis: {
                        type: 'category'
                    },
                    yAxis,
                    series
                }
            },
            genTreeMapOption(item, data){

            },
            genFunnelOption (item, data) {
                return {
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b} : {c}%"
                    },
                    legend: {
                        data: data.map(a => a[0])
                    },
                    calculable: true,
                    series: [
                        {
                            name: '漏斗图',
                            type: 'funnel',
                            left: '10%',
                            top: 60,
                            bottom: 60,
                            width: '80%',
                            min: 0,
                            max: 100,
                            minSize: '0%',
                            maxSize: '100%',
                            sort: 'descending',
                            gap: 2,
                            label: {
                                show: true,
                                position: 'inside'
                            },
                            labelLine: {
                                length: 10,
                                lineStyle: {
                                    width: 1,
                                    type: 'solid'
                                }
                            },
                            itemStyle: {
                                borderColor: '#fff',
                                borderWidth: 1
                            },
                            emphasis: {
                                label: {
                                    fontSize: 20
                                }
                            },
                            data: data.map(a => {
                                return {value: (a[1] / data[0][1] * 100).toFixed(0), name: a[0]}
                            })
                        }
                    ]
                }
            },
            genBarOption (item, data){
                let dataZoom = []
                let axisLabel = {}
                let grid = undefined
                if (data.length >= 8) {

                    axisLabel = {rotate: 30, interval: 0}
                }
                if (data.length >= 16) {
                    dataZoom.push(
                        {
                            id: 'dataZoomX',
                            type: 'slider',
                            xAxisIndex: [0],
                            filterMode: 'filter',
                            show: true,
                            start: 0,
                            end: 900 / data.length
                        })
                    grid = {
                        bottom: '33%',
                    }
                }
                return {
                    dataZoom,
                    dataset: {
                        source: data
                    },
                    xAxis: {
                        type: 'category', axisLabel
                    },
                    grid,
                    yAxis: {
//                        position: 'top',
                        type: 'value',
                    },
                    series: [{
                        type: 'bar',
                        smooth: true,
                        name: item.title
                    }]
                }
            },
            loadTimeData(period){
                period = period instanceof Array ? `${period[0]}至${period[1]}` : period
                let context = {measures: this.items.map((a) => a.name), period, time_field: this.$attrs.timeField}
                let qs = Qs.stringify(context, {indices: false})
                this.loading = "加载中"
                let url = this.url
                if (!url.includes('?')) {
                    url = url.concat('?')
                }
                this.$http.get(`${url}&${qs}`).then(({data}) => {
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
                    let optionFunc = a.type == 'daily' ? this.genDailyOption : (a.type === 'funnel' ? this.genFunnelOption : this.genBarOption)
                    res[a.name] = {
                        ...COMMON_OPTIONS,
                        title: {
                            text: a.title
                        },
                        ...optionFunc(a, this.chartData[a.name]),
                        ...a.options
                    }
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
