<script setup>
import { ref } from 'vue'

defineEmits(['back', 'next'])

const hasAgreed = ref(false)
</script>

<template>
  <section class="gvip-demo-agreement">
    <div class="gvip-demo-agreement__shell">
      <div class="gvip-demo-agreement__panel">
        <p class="gvip-demo-agreement__eyebrow">Application Agreement</p>
        <h1 class="gvip-demo-agreement__title">保密协议与申请人承诺</h1>
        <p class="gvip-demo-agreement__subtitle">
          Confidentiality & Applicant Declaration
        </p>

        <div class="gvip-demo-agreement__content">
          <p>
            您即将进入 GVIP 全球资本 CEO 报名表。为保护申请资料、项目信息与评审流程，
            本 Demo 页面仅展示报名流程骨架，实际申请内容应由申请人本人审阅、确认并提交。
          </p>
          <p>
            申请人承诺所填写的信息真实、完整、准确，并理解相关材料仅用于 GVIP 申请审核、
            内部评估及必要的项目沟通，不会在未经授权的情况下对外披露。
          </p>
          <p>
            进入下一步即表示您认可本页面所示声明，并愿意在后续正式表单中继续完成资料填写。
          </p>
        </div>

        <label class="gvip-demo-agreement__check">
          <input v-model="hasAgreed" type="checkbox" />
          <span>我已阅读并同意以上声明</span>
        </label>
      </div>

      <div class="gvip-demo-agreement__footer">
        <button type="button" class="gvip-demo-agreement__button gvip-demo-agreement__button--ghost" @click="$emit('back')">
          返回封面
        </button>
        <button
          type="button"
          class="gvip-demo-agreement__button gvip-demo-agreement__button--primary"
          :disabled="!hasAgreed"
          @click="$emit('next')"
        >
          进入报名表
        </button>
      </div>
    </div>
  </section>
</template>
