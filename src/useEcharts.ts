import {onMounted, onUnmounted, shallowRef} from "vue";
import {init} from "echarts";
import type {Ref} from "vue";
import type {ECharts} from "echarts";

type EchartsInitOpt = Parameters<init>[2]

/**
 * 获得一个Echarts实例
 * @param dom 实例绑定到元素
 * @param theme
 * @param opt
 */
export const useEcharts = (dom: Ref<HTMLElement | undefined | null>, theme?: string, opt?: EchartsInitOpt) => {
    const instance = shallowRef<ECharts>()
    const observer = new ResizeObserver(() => {
        instance.value?.resize()
    })

    onMounted(() => {
        if (dom.value) {
            instance.value = init(dom.value, theme, opt)
            observer.observe(dom.value!)
        }
    })

    onUnmounted(() => {
        instance.value?.dispose()
        observer.disconnect()
    })

    return instance
}
