<script setup lang="ts">
import {createApp, onMounted, ref} from "vue";
import {useEcharts} from "./useEcharts";
import Tooltip from './Tooltip.vue'
import {TooltipCE} from "./ceRegistry";


const chartDom = ref<HTMLDivElement>()
const instance = useEcharts(chartDom)

// 创建一次tooltipCe的实例，new或者document.createElement('my-tooltip')都可以
const tooltipCE = new TooltipCE()
const option = {
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      // Use axis to trigger tooltip
      type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
    },
    // createApp方式
    // formatter: (params) => {
    //   console.log(params) // 本例中参数是数组，请根据你的实际情况来
    //   if (params.length) {
    //     // 准备好tooltip需要的数据
    //     const title = params[0].axisValueLabel
    //     const rows = params.map(item => ({label: item.seriesName, value: item.data}))
    //     // 容器，之后会把组件渲染在容器中
    //     const div = document.createElement('div')
    //     // vue文件直接用不行，得创建app实例,同时提供组件的props
    //     const app = createApp(Tooltip, {title, rows})
    //     // 将app实例挂载到dom上
    //     app.mount(div)
    //     // 将含有组件实例的dom返回给echats
    //     return div
    //   }
    // },
    // customElement方式
    formatter: (params) => {
      console.log(params) // 本例中参数是数组，请根据你的实际情况来
      if (params.length) {
        // 准备好tooltip需要的数据
        const title = params[0].axisValueLabel
        const rows = params.map(item => ({label: item.seriesName, value: item.data}))
        // 设置props属性，对于string\number\boolean可以直接设置标签的attribute,也可以在实例上设置
        // 其他标签有的方法它都有
        tooltipCE.setAttribute('name', title)
        // 复杂属性使用实例来设置，比如array/object
        tooltipCE.rows = rows
        return tooltipCE
      }
    }
  },
  legend: {},
  xAxis: {
    type: 'value'
  },
  yAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  series: [
    {
      name: 'Direct',
      type: 'bar',
      stack: 'total',
      label: {
        show: true
      },
      emphasis: {
        focus: 'series'
      },
      data: [320, 302, 301, 334, 390, 330, 320]
    },
    {
      name: 'Mail Ad',
      type: 'bar',
      stack: 'total',
      label: {
        show: true
      },
      emphasis: {
        focus: 'series'
      },
      data: [120, 132, 101, 134, 90, 230, 210]
    },
    {
      name: 'Affiliate Ad',
      type: 'bar',
      stack: 'total',
      label: {
        show: true
      },
      emphasis: {
        focus: 'series'
      },
      data: [220, 182, 191, 234, 290, 330, 310]
    },
    {
      name: 'Video Ad',
      type: 'bar',
      stack: 'total',
      label: {
        show: true
      },
      emphasis: {
        focus: 'series'
      },
      data: [150, 212, 201, 154, 190, 330, 410]
    },
    {
      name: 'Search Engine',
      type: 'bar',
      stack: 'total',
      label: {
        show: true
      },
      emphasis: {
        focus: 'series'
      },
      data: [820, 832, 901, 934, 1290, 1330, 1320]
    }
  ],
};

onMounted(() => {
  instance.value?.setOption(option)
})
</script>

<template>
  <div ref="chartDom" style="width: 600px;height: 450px"/>
</template>
