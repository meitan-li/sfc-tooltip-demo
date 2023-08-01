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
