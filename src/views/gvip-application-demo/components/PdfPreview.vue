<script setup>
defineProps({
  formData: {
    type: Object,
    required: true,
  },
  industryOptions: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <article class="gvip-demo-pdf-preview">
    <header class="gvip-demo-pdf-preview__hero">
      <p class="gvip-demo-pdf-preview__eyebrow">GVIP Application Form</p>
      <h1>GVIP 全球资本CEO 报名表</h1>
      <p>Preview Only</p>
    </header>

    <section class="gvip-demo-pdf-section">
      <div class="gvip-demo-pdf-section__heading">
        <h2>基本信息</h2>
        <span>Personal Information</span>
      </div>
      <div class="gvip-demo-pdf-grid">
        <div><strong>中文姓名</strong><span>{{ formData.personalInfo.cnName || '未填写' }}</span></div>
        <div><strong>英文姓名</strong><span>{{ formData.personalInfo.enName || '未填写' }}</span></div>
        <div><strong>手机号</strong><span>{{ formData.personalInfo.mobilePhone || '未填写' }}</span></div>
        <div><strong>邮箱</strong><span>{{ formData.personalInfo.email || '未填写' }}</span></div>
      </div>
    </section>

    <section class="gvip-demo-pdf-section">
      <div class="gvip-demo-pdf-section__heading">
        <h2>工作背景</h2>
        <span>Professional Information</span>
      </div>
      <div class="gvip-demo-pdf-grid">
        <div><strong>职位</strong><span>{{ formData.professionalInfo.position || '未填写' }}</span></div>
        <div><strong>公司名称</strong><span>{{ formData.professionalInfo.organizationNameCn || '未填写' }}</span></div>
        <div><strong>工作年限</strong><span>{{ formData.professionalInfo.totalWorkYears || '未填写' }}</span></div>
      </div>
    </section>

    <section class="gvip-demo-pdf-section">
      <div class="gvip-demo-pdf-section__heading">
        <h2>其他信息</h2>
        <span>Other Information</span>
      </div>
      <div class="gvip-demo-pdf-block">
        <strong>申请动机</strong>
        <p class="gvip-demo-pdf-paragraph">{{ formData.otherInfo.applicationMotivation || '未填写' }}</p>
      </div>
      <div class="gvip-demo-pdf-block">
        <strong>发展目标</strong>
        <p class="gvip-demo-pdf-paragraph">{{ formData.otherInfo.developmentGoals || '未填写' }}</p>
      </div>
    </section>

    <section class="gvip-demo-pdf-section">
      <div class="gvip-demo-pdf-section__heading">
        <h2>签名确认</h2>
        <span>Signature Page</span>
      </div>
      <div class="gvip-demo-pdf-grid">
        <div><strong>签名</strong><span>{{ formData.signature.applicantSignature || '未填写' }}</span></div>
        <div><strong>日期</strong><span>{{ formData.signature.applicationDate || '未填写' }}</span></div>
      </div>
    </section>
  </article>
</template>
