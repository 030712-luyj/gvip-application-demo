<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'

const emit = defineEmits(['back', 'next'])

const AGREEMENT_STORAGE_KEY = 'GVIP_APPLICATION_AGREEMENT_ACCEPTED'
const AGREEMENT_VERSION = '2026-07-v1'

const agreementSections = [
  {
    title: '一、协议目的与适用范围',
    english: 'Purpose and Scope',
    paragraphs: [
      '为保障 GVIP 全球资本CEO 报名、审核、面试、录取及后续学习服务过程中的信息安全，申请人在进入填写系统前，应完整阅读并确认本协议。',
      '本协议适用于申请人在报名、提交材料、参与沟通、面试审核、课程学习、课后交流、企业参访及相关活动中接触、提交、接收或使用的全部信息。',
      '申请人确认，系统中填写或提交的个人资料、工作背景、企业信息、申请动机、签名确认及其他申请文件，将仅用于项目受理、审核、翻译、评估、录取与学员服务等合理目的。'
    ]
  },
  {
    title: '二、保密信息范围',
    english: 'Scope of Confidential Information',
    bullets: [
      '申请人提交的报名资料，包括身份信息、联系方式、教育与工作经历、企业与经营信息、附件材料及其他申请数据。',
      '项目审核与沟通过程中形成的意见、记录、评估结果、内部流程及其他未公开信息。',
      '课程资料、教案、案例材料、导师分享、课堂讨论、作业讲义、内部通知及其他未公开教学内容。',
      '同学、嘉宾、合作机构或企业在课堂、交流或参访中披露的个人信息、商业信息、经营信息及非公开内容。',
      '报名系统、课程平台、导出文件、后台数据、日志信息及与系统和数据安全相关的资料。'
    ]
  },
  {
    title: '三、报名资料使用与保护',
    english: 'Use and Protection of Application Materials',
    highlight: true,
    paragraphs: [
      '项目办公室及其授权人员仅可在实现项目报名、审核、翻译、面试、录取、服务与管理的必要范围内处理申请资料。',
      '项目办公室将采取合理必要的安全措施保护申请资料，防止资料被未授权访问、泄露、篡改、丢失或滥用。',
      '因审核、翻译、录取评估、课程服务或合规管理需要，项目办公室可在必要范围内向授权人员或合作方提供资料，但相关人员须承担相应保密义务。',
      '申请人应确保所提交资料真实、准确、完整，不得冒用他人身份、提交虚假信息或隐瞒重大事实。'
    ]
  },
  {
    title: '四、申请人及学员保密义务',
    english: 'Confidentiality Obligations During Participation',
    bullets: [
      '未经项目办公室或信息权利人事先书面同意，不得向无关第三方披露、传播、出售、转让、交换、复制、截图、拍照、录屏、录音或不当使用保密信息。',
      '不得将项目系统、课程资料、课堂内容、同学发言、企业参访信息或其他内部资料发布至社交媒体、公开网站或其他外部渠道。',
      '不得将课程资料、案例材料、导师观点、企业交流内容用于与项目学习无关的商业推广、融资宣传、客户开发或其他未经授权用途。',
      '对于课堂讨论、同学分享或企业交流中涉及的个人经历、企业经营、财务数据、客户资料及商业秘密，应严格保密。'
    ]
  },
  {
    title: '五、学习期间行为规范',
    english: 'Code of Conduct',
    paragraphs: [
      '申请人及学员应尊重教授、导师、同学、嘉宾及合作机构的知识产权、隐私权、名誉权及商业秘密，不得以任何方式干扰课堂秩序或误导他人。',
      '不得以项目名义、学校名义、教授导师名义或同学企业名义进行未经授权的宣传、背书、合作或融资活动。',
      '未经书面许可，不得引用或对外发布项目内部资料、课程内容、导师观点或课堂案例。'
    ]
  },
  {
    title: '六、账号、文件与数据安全',
    english: 'Account, File and Data Security',
    highlight: true,
    bullets: [
      '妥善保管个人账号、密码、验证码、访问链接及相关权限，不得转借、转发或共享给他人。',
      '不得使用他人账号进入报名系统、课程平台或项目相关工具，不得冒用、盗用或借用他人身份。',
      '不得通过未授权方式下载、复制、导出、转存、备份、打印、拍照或截取项目资料与报名数据。',
      '如发现账号异常、资料误发、信息泄露、设备遗失或其他安全风险，应立即通知项目办公室并配合处理。'
    ]
  },
  {
    title: '七、保密期限',
    english: 'Duration of Confidentiality Obligations',
    paragraphs: [
      '保密义务自申请人接触、知悉、获取、提交或使用保密信息之日起生效。',
      '对于申请资料、个人信息、课程资料、课堂内容、同学信息、企业参访信息及其他依法或依约应受保护的信息，保密义务在报名结束、课程结束、退出项目或未被录取后仍持续有效。',
      '除非相关信息已通过合法公开渠道公开，或项目办公室与信息权利人书面解除保密义务，否则申请人不得擅自披露。'
    ]
  },
  {
    title: '八、违约责任',
    english: 'Liability for Breach',
    bullets: [
      '项目办公室有权要求申请人立即停止违约行为，删除、返还或销毁相关资料，并消除影响。',
      '项目办公室有权暂停或取消报名资格、面试资格、录取资格、课程参与资格及相关服务。',
      '申请人应承担因违约行为造成的损失，包括直接损失、调查取证费用、律师费、公证费、诉讼费及其他合理维权成本。',
      '如相关行为涉嫌违法违规，项目办公室有权向有关机构、主管部门或司法机关主张权利。'
    ]
  },
  {
    title: '九、申请人声明',
    english: 'Applicant Declaration',
    highlight: true,
    bullets: [
      '本人已完整阅读并理解本协议全部内容，知悉报名资料保密、个人信息保护、学习期间保密及数据安全相关义务。',
      '本人在报名系统中填写、上传和提交的资料均真实、准确、完整，不存在虚假、误导、冒用、伪造或重大遗漏。',
      '本人同意项目办公室及其授权人员在项目申请、审核、翻译、评估、录取、服务及管理所必需的范围内处理本人报名资料。',
      '本人承诺在申请、面试、学习、交流、企业参访及相关活动期间，对接触、知悉、获取或使用的保密信息承担保密义务。',
      '本人理解，如因提交虚假资料、违反保密义务或违反数据安全要求，可能导致申请失败、录取取消或其他相应责任。'
    ]
  },
  {
    title: '十、最终确认',
    english: 'Final Confirmation',
    paragraphs: [
      '请在进入报名表填写系统前确认：本人已认真阅读、充分理解并同意遵守《保密协议与申请人承诺》的全部内容。'
    ]
  }
]
const agreementAccepted = ref(false)
const acceptedAt = ref('')
const agreementError = ref('')
const agreementScrollRef = ref(null)
const scrollProgress = ref(0)

const hasAcceptedBefore = computed(() => Boolean(acceptedAt.value))

function readStoredAgreement() {
  try {
    const raw = localStorage.getItem(AGREEMENT_STORAGE_KEY)
    if (!raw) return

    const parsed = JSON.parse(raw)
    if (parsed?.accepted && parsed?.version === AGREEMENT_VERSION) {
      agreementAccepted.value = true
      acceptedAt.value = parsed.acceptedAt || ''
    }
  } catch (error) {
    console.error('[GVIP AGREEMENT] failed to read localStorage', error)
  }
}

function handleAgreementAcceptedChange() {
  agreementError.value = ''
}

function handleAgreementScroll() {
  const el = agreementScrollRef.value
  if (!el) return

  const maxScroll = el.scrollHeight - el.clientHeight
  if (maxScroll <= 0) {
    scrollProgress.value = 100
    return
  }

  scrollProgress.value = Math.min(
    100,
    Math.max(0, Math.round((el.scrollTop / maxScroll) * 100)),
  )
}

function handleEnterForm() {
  if (!agreementAccepted.value) {
    agreementError.value = '请先勾选确认已阅读并同意协议内容'
    return
  }

  const acceptedRecord = {
    accepted: true,
    acceptedAt: new Date().toISOString(),
    version: '2026-07-v1',
  }

  acceptedAt.value = acceptedRecord.acceptedAt
  localStorage.setItem(AGREEMENT_STORAGE_KEY, JSON.stringify(acceptedRecord))

  emit('next')
}

onMounted(() => {
  readStoredAgreement()
  nextTick(() => {
    handleAgreementScroll()
  })
})
</script>

<template>
  <section class="gvip-demo-agreement-page">
    <div class="gvip-demo-agreement-card">
      <header class="gvip-demo-agreement-header">
        <div class="gvip-demo-agreement-header__copy">
          <p class="gvip-demo-agreement-header__eyebrow">Application Agreement</p>
          <h1>保密协议与申请人承诺</h1>
          <p class="gvip-demo-agreement-header__subtitle">
            Confidentiality Agreement & Applicant Declaration
          </p>
        </div>

        <div class="gvip-demo-agreement-progress">
          <div class="gvip-demo-agreement-status-title">
            <span class="gvip-demo-agreement-status-cn">协议全文</span>
            <span class="gvip-demo-agreement-status-en">Full Agreement</span>
          </div>
          <div class="gvip-demo-agreement-status-meta">
            <span class="gvip-demo-agreement-status-confirmed">
              {{ agreementAccepted ? '已确认' : '待确认' }}
            </span>
            <span class="gvip-demo-agreement-status-percent">{{ scrollProgress }}%</span>
          </div>
        </div>
      </header>

      <div class="gvip-demo-agreement-progressbar" aria-hidden="true">
        <span :style="{ width: `${scrollProgress}%` }"></span>
      </div>

      <main
        ref="agreementScrollRef"
        class="gvip-demo-agreement-scroll"
        @scroll="handleAgreementScroll"
      >
        <section class="gvip-demo-agreement-hero">
          <p class="gvip-demo-agreement-hero__eyebrow">FULL TEXT</p>
          <h2>完整保密协议条款</h2>
          <p class="gvip-demo-agreement-hero__subtitle">
            Full confidentiality terms for application, review, learning participation and data
            security.
          </p>
          <p class="gvip-demo-agreement-hero__intro">
            请在进入报名表填写系统前，完整阅读以下保密协议与申请人承诺。该协议适用于报名资料填写、项目申请审核、资料翻译、面试评估、录取沟通、课程学习、同学交流、企业参访及相关数据安全管理等全过程。
          </p>
        </section>

        <article
          v-for="section in agreementSections"
          :key="section.title"
          class="gvip-demo-agreement-section"
          :class="{ 'is-highlight': section.highlight }"
        >
          <header class="gvip-demo-agreement-section__header">
            <h3>{{ section.title }}</h3>
            <p>{{ section.english }}</p>
          </header>

          <div v-if="section.paragraphs?.length" class="gvip-demo-agreement-section__content">
            <p v-for="paragraph in section.paragraphs" :key="paragraph">
              {{ paragraph }}
            </p>
          </div>

          <ul v-if="section.bullets?.length" class="gvip-demo-agreement-section__list">
            <li v-for="bullet in section.bullets" :key="bullet">
              {{ bullet }}
            </li>
          </ul>
        </article>
      </main>

      <footer class="gvip-demo-agreement-actions">
        <label class="gvip-demo-agreement-confirm-inline">
          <input
            type="checkbox"
            v-model="agreementAccepted"
            @change="handleAgreementAcceptedChange"
          />
          <span>
            我已完整阅读并同意《保密协议与申请人承诺》，并承诺对报名资料、项目内容、学习期间信息及相关数据承担保密义务。
          </span>
        </label>

        <div class="gvip-demo-agreement-actions__submit">
          <button
            type="button"
            class="gvip-demo-agreement-primary gvip-demo-agreement-primary--gold"
            :disabled="!agreementAccepted"
            @click="handleEnterForm"
          >
            我已阅读并同意，进入填写系统
          </button>
          <p v-if="agreementError" class="gvip-demo-agreement-confirm-wrap__error">
            {{ agreementError }}
          </p>
        </div>
      </footer>
    </div>
  </section>
</template>

