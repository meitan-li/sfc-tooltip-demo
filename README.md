---
theme: juejin
---
ECharts的tooltip中的[formatter](https://echarts.apache.org/zh/option.html#tooltip.formatter)函数提供了富文本或函数回调的方式来允许开发者自定义tooltip中的内容。

接下来通过探索tooltip.formatter的用法来一步步实现在tooltip中使用Vue组件，举一反三同样的方式也可以实现类似Element Plus中的`ElMessage.success()`使用调用函数的方式来调用显示Vue组件。

# 1. 简单的tooltip内容
ECharts的tooltip.formatter提供了字符串模板，通过配置模板可以很容易实现一些简单的tooltip内容定制。

同时formatter还接受一个回调函数，函数的返回值可以是`string`,`HTMLElement`,`HTMLElement[]`, 字符串可以是模板也可以是html或者二者皆有。

一个使用模板字符串的例子： 直接粘贴到 https://echarts.apache.org/examples/zh/editor.html 看效果
```js
option = {
   xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
   },
   yAxis: {
      type: 'value'
   },
   series: [
      {
         data: [120, 200, 150, 80, 70, 110, 130],
         type: 'bar',
         showBackground: true,
         backgroundStyle: {
            color: 'rgba(180, 180, 180, 0.2)'
         }
      }
   ],
   tooltip: {
      show: true,
      // 模板字符串
      // formatter: 'x轴:{b}，y轴:<b>{c}</b><br />啊哈哈',

      // 回调函数返回html
      // formatter: (params) => {
      //   console.log(params);
      //   return `<div>
      //     <span style="color: red;">${params.name}</span>
      //     <span style="font-weight: bold">${params.data}</span>
      //   </div>`;
      // },

      // 回调函数返回Dom
      formatter: (params) => {
         console.log(params);
         const div = document.createElement('div');
         const span = document.createElement('span');
         span.style.color = 'red';
         span.innerText = params.data;
         div.appendChild(span);
         return div;
      }
   }
};
```
tooltip提供的方式已经可以满足绝大多数场景了，如果不需要太复杂的tooltip，优先还是使用这些方式。

# 2. 复杂的tooltip内容
如果需要展示较复杂的tooltip，可以使用模板字符串拼接html或是直接用js创建dom的方式来实现。

不过这样写起来十分不方便，还是写Vue组件来得快。

## 方式一： 使用createApp

首先准备一个组件，注意这里我写了两个props，一个是string，一个是数组：

Tooltip.vue
```js
<script setup lang="ts">
   import {defineProps} from "vue";

   defineProps<{ title: string, rows?: { label: string, value: number }[] }>()
</script>

<template>
   <div class="title">{{ title }}</div>
   <table>
      <tr>
         <th>类别</th>
         <th>数据</th>
      </tr>
      <tr v-for="data in rows" :key="data.label">
      <td class="label">{{ data.label }}</td>
      <td class="value">{{ data.value }}</td>
   </tr>
</table>
</template>


<style scoped>
   .title {
   text-align: center;
   font-weight: bold;
}

   .label {
   color: #333333;
}

   .value {
   font-weight: bold;
   text-align: right;
}

   table, td, th {
   border-collapse: collapse;
   border: 1px solid #333333;
}
</style>
```
> 这里只是写了简单的table，实际上里面多复杂都行，表单、el-table都行，vue组件中能干的都能往里写

接下来让tooltip接受并渲染这个组件：

App.vue (只提供了核心代码，之后有完整代码)
```js
// 导入组件
import Tooltip from './Tooltip.vue'

// ECharts的Options
const option = {
   tooltip: {
      trigger: 'axis',
      axisPointer: {
         // Use axis to trigger tooltip
         type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
      },
      formatter: (params) => {
         console.log(params) // 本例中参数是数组，请根据你的实际情况来
         if (params.length) {
            // 准备好tooltip需要的数据
            const title = params[0].axisValueLabel
            const rows = params.map(item => ({label: item.seriesName, value: item.data}))
            // 容器，之后会把组件渲染在容器中
            const div = document.createElement('div')
            // vue文件直接用不行，得创建app实例,同时提供组件的props
            const app = createApp(Tooltip, {title, rows})
            // 将app实例挂载到dom上
            app.mount(div)
            // 将含有组件实例的dom返回给echats
            return div
         }
      }
   },
   // ... 其他echats配置
};

// ... 创建echats实例并设置optons
```
当当当当！

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bc4fdf07e1cf4fbabdc0ad85978dbb75~tplv-k3u1fbpfcp-watermark.image?)


**优点**：
* 使用方便，项目不需要特别设置就能用

**缺点**
* tooltip的回调实际上十分频繁，每次都创建app实例，性能开销太大
* createApp的rootProps没有好的类型推断
* 将会在vue devtools中看到一堆app实例

优势明显，缺陷也很明显。<br/>
**为了避免每次都创建app实例，可以将`createApp(Tooltip)`放在回调外只调用一次，确实可以提高性能，但是这样就不能动态改变传递给组件的参数props了** <br/>
**只调用一次，还想动态改变参数也是有办法的，可以给app挂载一个`vuex/pinia`, 内部使用store获取值，外部使用store修改值**

这里不展开了，可以自己去尝试。接下来介绍customElement的方式。

# 方式二： 使用customElement

[customElement](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_components/Using_custom_elements)是一种允许开发者自定义标签的技术。其[兼容性](https://caniuse.com/?search=customElement "customElement兼容性")很好，可以放心使用。

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9ffec27cc00a43f38388df426949a8e2~tplv-k3u1fbpfcp-watermark.image?)

如果不了解customElement也没关系，只要知道它是能让浏览器认识并正确渲染你的标签的技术，比如`<my-element value="这是我的组件的props">这是我的组件</my-element>`。

如果用原生去实现一个customElement，那费劲的不如去拼接html字符串。好在现代前端框架都提供了创建customElement的方法，比如Vue的： [在 Vue 中使用自定义元素](https://cn.vuejs.org/guide/extras/web-components.html#using-custom-elements-in-vue)

**注意这里** 由于style会被抽离出组件中，如果你不想样式失效，或组件样式被外部影响，那么可以使用`自定义元素模式`，方式很简单，将组件改为`.ce.vue`即可：

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2dab768292114661844544f0653c84fa~tplv-k3u1fbpfcp-watermark.image?)

OK，开整！<br/>
首先将上面的Tooltip.vue，重命名为`Tooltip.ce.vue`(由于title和HTML标签本身的属性冲突了，改名为name了，并且title的颜色改成了红色以示区别,其余代码与Tooltip.vue相同)
```js
<script setup lang="ts">
import {defineProps} from "vue";

defineProps<{ name: string, rows?: { label: string, value: number }[] }>()
</script>

<template>
  <div class="title">{{ name }}</div>
  <table>
    <tr>
      <th>类别</th>
      <th>数据</th>
    </tr>
    <tr v-for="data in rows" :key="data.label">
      <td class="label">{{ data.label }}</td>
      <td class="value">{{ data.value }}</td>
    </tr>
  </table>
</template>


<style scoped>
.title {
  text-align: center;
  font-weight: bold;
  color: red;
}

.label {
  color: #333333;
}

.value {
  font-weight: bold;
  text-align: right;
}

table, td, th {
  border-collapse: collapse;
  border: 1px solid #333333;
}
</style>
```
然后在main（或者其他你喜欢的位置）中注册它：
```js
/**
 * 注册customElement
 */
import {defineCustomElement} from "vue";
import Tooltip from './Tooltip.ce.vue'
import type {VueElementConstructor} from "@vue/runtime-dom";

// 使用vue创建自定义元素
// 如果不需要类型定义那么直接const TooltipCE = defineCustomElement(Tooltip)就可以
// 由于之前定义的title props和所有HTML元素本身就有的title冲突了，所以改为name
export const TooltipCE = defineCustomElement(Tooltip) as VueElementConstructor<{ name?: string, rows: { label: string, value: number }[] }>

// 向浏览器注册自定义标签，标签名为my-tooltip
window.customElements.define('my-tooltip', TooltipCE)
```
然后就像使用div一样使用它：
```js
import {TooltipCE} from "./ceRegistry";

// 创建一次tooltipCe的实例，new或者document.createElement('my-tooltip')都可以
const tooltipCE = new TooltipCE()
const option = {
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      // Use axis to trigger tooltip
      type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
    },
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
  // ... 其他Echarts Options
};
```

当当当当！
![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/29ee9da525514c18af597a0e4af505cc~tplv-k3u1fbpfcp-watermark.image?)

看下浏览器dom里什么样：

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/32a797ca0e6b41aba8b661cd06dc5b18~tplv-k3u1fbpfcp-watermark.image?)
可以看到我们自定义的标签my-tooltip生效了。

同样的，里面也可以写任何vue里能写的东西。

**优点**
* 只创建一个dom实例，性能嘎嘎好
* 直接通过dom实例修改属性来通信，简单易用
* 良好的TS类型推断
* 十分方便使用的插槽

**缺点**
* 可能会增加打包体积，详情参考: [基于 Vue 构建自定义元素库](https://cn.vuejs.org/guide/extras/web-components.html#building-custom-elements-with-vue)

> 如果想在Vue模板中使用该自定义标签，还需要特别配置: [跳过组件解析](https://cn.vuejs.org/guide/extras/web-components.html#skipping-component-resolution)

# 完整代码
掘金自带的代码片段不好用，直接放github上了
https://github.com/meitan-li/sfc-tooltip-demo

# 最后
* 同样的，利用`createApp`或`customElement`可以在js中使用Vue组件的特性。可以创建一个函数，函数中使用它们来渲染一个dom，再将dom插入到body中，不就可以实现类似Element的`ElMessage.success`的效果！
