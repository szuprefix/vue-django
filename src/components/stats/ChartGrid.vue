<template>
    <el-row>
        <el-col :sm="24" :md="12" :xl="8" v-for="c in items" :key="c.name">
            <chart v-if="chartData[c.name]" :options="chartOptions[c.name]" :auto-resize="true"></chart>
        </el-col>
    </el-row>
</template>
<script>
    import Qs from 'qs'
    export default{
        props: {
            period: Array,
            url:String,
            items: Array,
            base: String
        },
        data () {
            return {
                chartData: {}
            }
        },
        components: {},
        mounted() {
            this.loadTimeData(this.period)
        },
        methods: {
            genDailyOption(item, data){
                return {
                    title: {
                        text: item.title
                    },
                    visualMap: item.visualMap,
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross'
                        }
                    },
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
                        data: data.map((a) => a[1])
                    }]
                }
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
                return {
                    title: {
                        text: item.title
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross'
                        }
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
                        data: data.map((a) => a[1])
                    }]
                }
            },
            loadTimeData(period){
                let context = {measures: this.items.map((a) => a.name), period: `${period[0]}至${period[1]}`}
                let qs = Qs.stringify(context, {indices: false})
                this.$http.get(`${this.url}?${qs}`).then(({data}) => {
                    let ds = data
                    if(this.base){
                        ds=ds[this.base]
                    }
                    this.chartData = Object.assign({}, ds)
                })
            },
        },
        computed: {
            chartOptions(){
                let res = {}
                this.items.forEach((a) => {
                    let optionFunc = a.type == 'daily' ? this.genDailyOption: this.genBarOption
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
