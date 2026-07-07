<script setup>
import { computed, nextTick, ref } from 'vue'
import PdfPreview from './PdfPreview.vue'
import { exportPdf } from '../utils/exportPdf'
import { useApplicationForm } from '../utils/useApplicationForm'

const {
  addPreviousProgram,
  addWorkExperience,
  applicationSteps,
  clothingSizeOptions,
  currentStep,
  currentStepIndex,
  dismissNotice,
  errors,
  formData,
  genderOptions,
  goToNextStep,
  goToStep,
  idDocumentTypeOptions,
  industryOptions,
  listedCompanyOptions,
  notice,
  organizationTypeOptions,
  persistDraft,
  progressPercent,
  resetApplicationForm,
  removePreviousProgram,
  removePhotoFile,
  removeWorkExperience,
  setPhotoFile,
  validateFinalExport,
  visaOptions,
} = useApplicationForm()

const photoInput = ref(null)
const exportPreviewRef = ref(null)
const showPreview = ref(false)
const currentStepNumber = computed(() => currentStepIndex.value + 1)
const progressRingStyle = computed(() => ({
  background: `conic-gradient(#d6b06d ${progressPercent.value}%, rgba(255, 255, 255, 0.12) ${progressPercent.value}% 100%)`,
}))
const organizationIntroductionCount = computed(() => formData.organizationIntroduction.length)
const applicationMotivationCount = computed(() => formData.otherInfo.applicationMotivation.length)
const developmentGoalsCount = computed(() => formData.otherInfo.developmentGoals.length)
const achievementsCount = computed(() => formData.otherInfo.achievements.length)
const signatureErrors = computed(() => errors.signature || {})
const isFinalStep = computed(() => currentStepIndex.value === applicationSteps.length - 1)
const navPrimaryLabel = computed(() =>
  isFinalStep.value ? '完成并导出 PDF' : '继续下一步',
)
const stageCompletionItems = computed(() => [
  {
    title: '基本信息',
    completed: Boolean(
      formData.personalInfo.cnName.trim() &&
        formData.personalInfo.mobilePhone.trim() &&
        formData.personalInfo.email.trim() &&
        formData.personalInfo.email.includes('@'),
    ),
  },
  {
    title: '工作背景',
    completed: Boolean(
      formData.professionalInfo.position.trim() &&
        formData.professionalInfo.organizationNameCn.trim() &&
        formData.industryInfo.industryNumber &&
        formData.organizationIntroduction.trim(),
    ),
  },
  {
    title: '其他信息',
    completed: Boolean(
      formData.otherInfo.applicationMotivation.trim() &&
        formData.otherInfo.developmentGoals.trim() &&
        formData.otherInfo.achievements.trim(),
    ),
  },
  {
    title: '签名确认',
    completed: Boolean(
      formData.signature.confidentialityConfirmed &&
        formData.signature.declarationConfirmed &&
        formData.signature.applicantSignature.trim() &&
        formData.signature.applicationDate &&
        formData.signature.finalConfirmed,
    ),
  },
])

const triggerPhotoPicker = () => {
  photoInput.value?.click()
}

const handlePhotoChange = (event) => {
  const [file] = event.target.files || []
  setPhotoFile(file)
}

const handleRemovePhoto = () => {
  removePhotoFile()
  if (photoInput.value) {
    photoInput.value.value = ''
  }
}

const buildPdfFileName = () => {
  const applicantName = formData.personalInfo.cnName.trim() || '未填写姓名'
  const applicationDate = formData.signature.applicationDate || new Date().toISOString().slice(0, 10)
  const safeName = applicantName.replace(/[\\/:*?"<>|]/g, '_')

  return `GVIP报名表_${safeName}_${applicationDate}.pdf`
}

const handlePreview = () => {
  showPreview.value = true
  notice.value = {
    type: 'success',
    message: '已展开报名表预览，可检查四个阶段内容后再导出 PDF。',
  }
}

const handleExport = async () => {
  showPreview.value = true

  if (!validateFinalExport()) {
    return
  }

  await nextTick()

  if (!exportPreviewRef.value) {
    notice.value = {
      type: 'error',
      message: 'PDF 预览区域尚未准备完成，请稍后重试。',
    }
    return
  }

  try {
    await exportPdf({
      element: exportPreviewRef.value,
      fileName: buildPdfFileName(),
    })

    persistDraft('签名确认已保存，并已开始导出 PDF。')
  } catch (error) {
    console.error(error)
    notice.value = {
      type: 'error',
      message: '导出 PDF 失败，请稍后重试。',
    }
  }
}

const handlePrimaryAction = () => {
  if (isFinalStep.value) {
    handleExport()
    return
  }

  goToNextStep()
}

const handleClearDraft = () => {
  showPreview.value = false
  resetApplicationForm()
}
</script>

<template>
  <div class="gvip-demo gvip-demo--desktop gvip-demo-desktop-page">
    <header class="gvip-demo-desktop-header">
      <div class="gvip-demo-desktop-nav__brand">
        <div class="gvip-demo-desktop-nav__logo">4</div>
        <div class="gvip-demo-desktop-nav__brand-copy">
          <strong>Columbia Business School</strong>
          <span>Executive Education</span>
        </div>
      </div>

      <div class="gvip-demo-desktop-nav__title">GVIP 全球资本CEO 报名表 Demo</div>

      <div class="gvip-demo-desktop-nav__actions">
        <button type="button" class="gvip-demo-nav-link" @click="dismissNotice">帮助中心</button>
        <button
          type="button"
          class="gvip-demo-nav-button gvip-demo-nav-button--dark"
          @click="persistDraft()"
        >
          保存草稿
        </button>
        <button
          type="button"
          class="gvip-demo-nav-button gvip-demo-nav-button--gold"
          @click="handlePrimaryAction"
        >
          {{ navPrimaryLabel }}
        </button>
      </div>
    </header>

    <main class="gvip-demo-desktop-main">
      <aside class="gvip-demo-desktop-sidebar">
        <section class="gvip-demo-side-brand">
          <div>
            <p class="gvip-demo-side-brand__eyebrow">GVIP</p>
            <h2 class="gvip-demo-side-brand__title">Global Value Investors Program</h2>
          </div>
          <div class="gvip-demo-side-brand__badge">26-28</div>
        </section>

        <section class="gvip-demo-side-card">
          <nav class="gvip-demo-step-nav" aria-label="Application steps">
            <button
              v-for="(step, index) in applicationSteps"
              :key="step.key"
              type="button"
              class="gvip-demo-step-item"
              :class="{
                'is-active': index === currentStepIndex,
                'is-completed': index < currentStepIndex,
              }"
              @click="goToStep(index)"
            >
              <span class="gvip-demo-step-item__index">{{ index + 1 }}</span>
              <span class="gvip-demo-step-item__copy">
                <strong>{{ step.title }}</strong>
                <small>{{ step.navSubtitle || step.subtitle }}</small>
              </span>
            </button>
          </nav>
        </section>

        <section class="gvip-demo-security-card">
          <p class="gvip-demo-security-card__title">您的信息将被安全保护</p>
          <p class="gvip-demo-security-card__text">所有数据仅用于项目申请资料整理与内部审核。</p>
        </section>
      </aside>

      <section class="gvip-demo-desktop-content">
        <section class="gvip-demo-stage-banner">
          <div class="gvip-demo-hero-banner__content">
            <p class="gvip-demo-hero-banner__eyebrow">{{ currentStep.subtitle }}</p>
            <h1 class="gvip-demo-hero-banner__title">{{ currentStep.title }}</h1>
            <p class="gvip-demo-hero-banner__text">{{ currentStep.description }}</p>
          </div>

          <div class="gvip-demo-hero-banner__progress">
            <div class="gvip-demo-progress-ring" :style="progressRingStyle">
              <div class="gvip-demo-progress-ring__inner">{{ progressPercent }}%</div>
            </div>
            <p>Step {{ currentStepNumber }} / {{ applicationSteps.length }}</p>
          </div>
        </section>

        <section
          v-if="notice.message"
          class="gvip-demo-inline-notice"
          :class="`is-${notice.type}`"
        >
          {{ notice.message }}
        </section>

        <template v-if="currentStepIndex === 0">
          <section class="gvip-demo-form-card">
            <div class="gvip-demo-section-heading">
              <div>
                <h2>个人信息</h2>
                <p>Personal Information</p>
              </div>
            </div>

            <div class="gvip-demo-personal-layout">
              <div class="gvip-demo-form-grid gvip-demo-form-grid--triple">
                <div class="gvip-demo-field">
                  <label for="cnName">中文姓名 CN Name <span class="gvip-demo-required">*</span></label>
                  <input
                    id="cnName"
                    v-model="formData.personalInfo.cnName"
                    type="text"
                    class="gvip-demo-input"
                    :class="{ 'is-error': errors.personalInfo.cnName }"
                    placeholder="请输入中文姓名"
                  />
                  <small v-if="errors.personalInfo.cnName" class="gvip-demo-error-text">
                    {{ errors.personalInfo.cnName }}
                  </small>
                </div>

                <div class="gvip-demo-field">
                  <label for="enName">英文姓名 EN Name</label>
                  <input
                    id="enName"
                    v-model="formData.personalInfo.enName"
                    type="text"
                    class="gvip-demo-input"
                    placeholder="请输入英文姓名"
                  />
                </div>

                <div class="gvip-demo-field">
                  <label>性别 Gender</label>
                  <div class="gvip-demo-chip-group">
                    <label
                      v-for="option in genderOptions"
                      :key="option.value"
                      class="gvip-demo-chip"
                      :class="{ 'is-selected': formData.personalInfo.gender === option.value }"
                    >
                      <input v-model="formData.personalInfo.gender" type="radio" :value="option.value" />
                      <span>{{ option.label }}</span>
                    </label>
                  </div>
                </div>

                <div class="gvip-demo-field">
                  <label for="dateOfBirth">出生日期 Date of Birth</label>
                  <input
                    id="dateOfBirth"
                    v-model="formData.personalInfo.dateOfBirth"
                    type="date"
                    class="gvip-demo-input"
                  />
                </div>

                <div class="gvip-demo-field">
                  <label for="nationality">国籍 Nationality</label>
                  <input
                    id="nationality"
                    v-model="formData.personalInfo.nationality"
                    type="text"
                    class="gvip-demo-input"
                    placeholder="请输入国籍"
                  />
                </div>

                <div class="gvip-demo-field">
                  <label for="countryOfBirth">出生地点 Country of Birth</label>
                  <input
                    id="countryOfBirth"
                    v-model="formData.personalInfo.countryOfBirth"
                    type="text"
                    class="gvip-demo-input"
                    placeholder="请输入出生地点"
                  />
                </div>

                <div class="gvip-demo-field gvip-demo-field--full">
                  <label>证件类型 Type of ID Document</label>
                  <div class="gvip-demo-document-options">
                    <label
                      v-for="option in idDocumentTypeOptions"
                      :key="option.value"
                      class="gvip-demo-document-card"
                      :class="{ 'is-selected': formData.personalInfo.idDocumentType === option.value }"
                    >
                      <input
                        v-model="formData.personalInfo.idDocumentType"
                        type="radio"
                        :value="option.value"
                      />
                      <span>{{ option.label }}</span>
                    </label>
                  </div>
                </div>

                <div
                  v-if="formData.personalInfo.idDocumentType === 'other'"
                  class="gvip-demo-field gvip-demo-field--full"
                >
                  <label for="idDocumentOther">
                    其他证件说明 Other Document Type <span class="gvip-demo-required">*</span>
                  </label>
                  <input
                    id="idDocumentOther"
                    v-model="formData.personalInfo.idDocumentOther"
                    type="text"
                    class="gvip-demo-input"
                    :class="{ 'is-error': errors.personalInfo.idDocumentOther }"
                    placeholder="请输入其他证件说明"
                  />
                  <small v-if="errors.personalInfo.idDocumentOther" class="gvip-demo-error-text">
                    {{ errors.personalInfo.idDocumentOther }}
                  </small>
                </div>

                <div class="gvip-demo-field gvip-demo-field--full">
                  <label for="idNumber">证件号码 ID Number</label>
                  <input
                    id="idNumber"
                    v-model="formData.personalInfo.idNumber"
                    type="text"
                    class="gvip-demo-input"
                    placeholder="请输入证件号码"
                  />
                </div>

                <div class="gvip-demo-field">
                  <label>是否持有有效期内美国签证</label>
                  <div class="gvip-demo-chip-group">
                    <label
                      v-for="option in visaOptions"
                      :key="option.value"
                      class="gvip-demo-chip"
                      :class="{ 'is-selected': formData.personalInfo.hasUsVisa === option.value }"
                    >
                      <input v-model="formData.personalInfo.hasUsVisa" type="radio" :value="option.value" />
                      <span>{{ option.label }}</span>
                    </label>
                  </div>
                </div>

                <div class="gvip-demo-field">
                  <label for="visaExpirationDate">签证到期时间 Visa Expiration Date</label>
                  <input
                    id="visaExpirationDate"
                    v-model="formData.personalInfo.visaExpirationDate"
                    type="date"
                    class="gvip-demo-input"
                    :class="{ 'is-error': errors.personalInfo.visaExpirationDate }"
                    :disabled="formData.personalInfo.hasUsVisa !== 'yes'"
                  />
                  <small v-if="errors.personalInfo.visaExpirationDate" class="gvip-demo-error-text">
                    {{ errors.personalInfo.visaExpirationDate }}
                  </small>
                </div>

                <div class="gvip-demo-field">
                  <label for="workPhone">办公电话 Work Phone</label>
                  <input
                    id="workPhone"
                    v-model="formData.personalInfo.workPhone"
                    type="text"
                    class="gvip-demo-input"
                    placeholder="请输入办公电话"
                  />
                </div>

                <div class="gvip-demo-field">
                  <label for="mobilePhone">
                    手机号码 Mobile Phone <span class="gvip-demo-required">*</span>
                  </label>
                  <input
                    id="mobilePhone"
                    v-model="formData.personalInfo.mobilePhone"
                    type="text"
                    class="gvip-demo-input"
                    :class="{ 'is-error': errors.personalInfo.mobilePhone }"
                    placeholder="请输入手机号码"
                  />
                  <small v-if="errors.personalInfo.mobilePhone" class="gvip-demo-error-text">
                    {{ errors.personalInfo.mobilePhone }}
                  </small>
                </div>

                <div class="gvip-demo-field">
                  <label for="email">电子邮箱 Email <span class="gvip-demo-required">*</span></label>
                  <input
                    id="email"
                    v-model="formData.personalInfo.email"
                    type="email"
                    class="gvip-demo-input"
                    :class="{ 'is-error': errors.personalInfo.email }"
                    placeholder="请输入电子邮箱"
                  />
                  <small v-if="errors.personalInfo.email" class="gvip-demo-error-text">
                    {{ errors.personalInfo.email }}
                  </small>
                </div>

                <div class="gvip-demo-field gvip-demo-field--full">
                  <label for="address">通讯地址 Address</label>
                  <input
                    id="address"
                    v-model="formData.personalInfo.address"
                    type="text"
                    class="gvip-demo-input"
                    placeholder="请输入通讯地址"
                  />
                </div>

                <div class="gvip-demo-field">
                  <label for="clothingSize">衣服尺码 Clothing Size</label>
                  <select id="clothingSize" v-model="formData.personalInfo.clothingSize" class="gvip-demo-input">
                    <option value="">请选择衣服尺码</option>
                    <option v-for="option in clothingSizeOptions" :key="option" :value="option">
                      {{ option }}
                    </option>
                  </select>
                </div>

                <div class="gvip-demo-field">
                  <label for="linkedin">LinkedIn账号 LinkedIn Account</label>
                  <input
                    id="linkedin"
                    v-model="formData.personalInfo.linkedin"
                    type="text"
                    class="gvip-demo-input"
                    placeholder="请输入 LinkedIn 账号或链接"
                  />
                </div>
              </div>

              <aside class="gvip-demo-photo-card">
                <p class="gvip-demo-photo-card__title">两寸免冠证件照</p>
                <p class="gvip-demo-photo-card__subtitle">2-inch passport-style photo</p>

                <input
                  ref="photoInput"
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  class="gvip-demo-photo-card__input"
                  @change="handlePhotoChange"
                />

                <button type="button" class="gvip-demo-photo-card__upload" @click="triggerPhotoPicker">
                  <span>点击上传证件照</span>
                  <small>支持 JPG / PNG，建议白底证件照</small>
                </button>

                <div v-if="formData.personalInfo.idPhotoFileName" class="gvip-demo-photo-card__file">
                  <span>{{ formData.personalInfo.idPhotoFileName }}</span>
                  <button type="button" @click="handleRemovePhoto">删除</button>
                </div>
              </aside>
            </div>
          </section>

          <section class="gvip-demo-form-card">
            <div class="gvip-demo-section-heading">
              <div>
                <h2>指定联系人信息</h2>
                <p>Designated Contact Person Information</p>
              </div>
            </div>

            <div class="gvip-demo-form-grid gvip-demo-form-grid--triple">
              <div class="gvip-demo-field">
                <label for="contactCnName">中文姓名 CN Name</label>
                <input
                  id="contactCnName"
                  v-model="formData.contactPerson.cnName"
                  type="text"
                  class="gvip-demo-input"
                  placeholder="请输入联系人中文姓名"
                />
              </div>

              <div class="gvip-demo-field">
                <label for="contactEnName">英文姓名 EN Name</label>
                <input
                  id="contactEnName"
                  v-model="formData.contactPerson.enName"
                  type="text"
                  class="gvip-demo-input"
                  placeholder="请输入联系人英文姓名"
                />
              </div>

              <div class="gvip-demo-field">
                <label>性别 Gender</label>
                <div class="gvip-demo-chip-group">
                  <label
                    v-for="option in genderOptions"
                    :key="`contact-${option.value}`"
                    class="gvip-demo-chip"
                    :class="{ 'is-selected': formData.contactPerson.gender === option.value }"
                  >
                    <input v-model="formData.contactPerson.gender" type="radio" :value="option.value" />
                    <span>{{ option.label }}</span>
                  </label>
                </div>
              </div>

              <div class="gvip-demo-field">
                <label for="relationship">与申请人关系 Relationship</label>
                <input
                  id="relationship"
                  v-model="formData.contactPerson.relationship"
                  type="text"
                  class="gvip-demo-input"
                  placeholder="如：助理、配偶、同事等"
                />
              </div>

              <div class="gvip-demo-field">
                <label for="contactMobile">手机号码 Mobile Phone</label>
                <input
                  id="contactMobile"
                  v-model="formData.contactPerson.mobilePhone"
                  type="text"
                  class="gvip-demo-input"
                  placeholder="请输入联系人手机号"
                />
              </div>

              <div class="gvip-demo-field">
                <label for="contactEmail">电子邮箱 Email</label>
                <input
                  id="contactEmail"
                  v-model="formData.contactPerson.email"
                  type="email"
                  class="gvip-demo-input"
                  placeholder="请输入联系人邮箱"
                />
              </div>
            </div>
          </section>
        </template>

        <template v-else-if="currentStepIndex === 1">
          <section class="gvip-demo-form-card">
            <div class="gvip-demo-section-heading">
              <div>
                <h2>工作背景</h2>
                <p>Professional Information</p>
              </div>
            </div>

            <div class="gvip-demo-form-grid">
              <div class="gvip-demo-field">
                <label for="totalWorkYears">全职工作时间</label>
                <input
                  id="totalWorkYears"
                  v-model="formData.professionalInfo.totalWorkYears"
                  type="number"
                  min="0"
                  class="gvip-demo-input"
                  placeholder="单位：年"
                />
              </div>

              <div class="gvip-demo-field">
                <label for="managementYears">担任管理工作时间</label>
                <input
                  id="managementYears"
                  v-model="formData.professionalInfo.managementYears"
                  type="number"
                  min="0"
                  class="gvip-demo-input"
                  placeholder="单位：年"
                />
              </div>

              <div class="gvip-demo-field">
                <label for="currentOrganizationYears">在目前机构担任工作年限</label>
                <input
                  id="currentOrganizationYears"
                  v-model="formData.professionalInfo.currentOrganizationYears"
                  type="number"
                  min="0"
                  class="gvip-demo-input"
                  placeholder="单位：年"
                />
              </div>

              <div class="gvip-demo-field">
                <label for="professionalPosition">职务 Position</label>
                <input
                  id="professionalPosition"
                  v-model="formData.professionalInfo.position"
                  type="text"
                  class="gvip-demo-input"
                  placeholder="请输入职务"
                />
              </div>

              <div class="gvip-demo-field">
                <label for="employeeCount">雇员人数 Number of Employees</label>
                <input
                  id="employeeCount"
                  v-model="formData.professionalInfo.employeeCount"
                  type="number"
                  min="0"
                  class="gvip-demo-input"
                  placeholder="请输入雇员人数"
                />
              </div>
            </div>
          </section>

          <section class="gvip-demo-form-card">
            <div class="gvip-demo-section-heading">
              <div>
                <h2>企业信息</h2>
                <p>Organization Information</p>
              </div>
            </div>

            <div class="gvip-demo-form-grid">
              <div class="gvip-demo-field">
                <label for="organizationNameCn">现任单位名称中文</label>
                <input
                  id="organizationNameCn"
                  v-model="formData.professionalInfo.organizationNameCn"
                  type="text"
                  class="gvip-demo-input"
                  placeholder="请输入单位中文名称"
                />
              </div>

              <div class="gvip-demo-field">
                <label for="organizationNameEn">现任单位名称英文</label>
                <input
                  id="organizationNameEn"
                  v-model="formData.professionalInfo.organizationNameEn"
                  type="text"
                  class="gvip-demo-input"
                  placeholder="请输入单位英文名称"
                />
              </div>

              <div class="gvip-demo-field gvip-demo-field--full">
                <label for="website">现任单位网址 Website</label>
                <input
                  id="website"
                  v-model="formData.professionalInfo.website"
                  type="text"
                  class="gvip-demo-input"
                  placeholder="请输入公司网址"
                />
              </div>

              <div class="gvip-demo-field">
                <label>企业性质 Type of Organization</label>
                <div class="gvip-demo-chip-group">
                  <label
                    v-for="option in organizationTypeOptions"
                    :key="option.value"
                    class="gvip-demo-chip gvip-demo-chip--block"
                    :class="{ 'is-selected': formData.professionalInfo.organizationType === option.value }"
                  >
                    <input
                      v-model="formData.professionalInfo.organizationType"
                      type="radio"
                      :value="option.value"
                    />
                    <span>{{ option.label }}</span>
                  </label>
                </div>
              </div>

              <div v-if="formData.professionalInfo.organizationType === 'other'" class="gvip-demo-field">
                <label for="organizationTypeOther">企业性质其他说明</label>
                <input
                  id="organizationTypeOther"
                  v-model="formData.professionalInfo.organizationTypeOther"
                  type="text"
                  class="gvip-demo-input"
                  placeholder="请输入其他企业性质"
                />
              </div>

              <div class="gvip-demo-field">
                <label for="totalAssets">公司资产</label>
                <input
                  id="totalAssets"
                  v-model="formData.professionalInfo.totalAssets"
                  type="number"
                  min="0"
                  class="gvip-demo-input"
                  placeholder="单位：亿人民币"
                />
              </div>

              <div class="gvip-demo-field">
                <label for="annualRevenue">公司上年销售额</label>
                <input
                  id="annualRevenue"
                  v-model="formData.professionalInfo.annualRevenue"
                  type="number"
                  min="0"
                  class="gvip-demo-input"
                  placeholder="单位：亿人民币"
                />
              </div>

              <div class="gvip-demo-field">
                <label for="annualProfit">公司上年度利润额</label>
                <input
                  id="annualProfit"
                  v-model="formData.professionalInfo.annualProfit"
                  type="number"
                  min="0"
                  class="gvip-demo-input"
                  placeholder="单位：亿人民币"
                />
              </div>

              <div class="gvip-demo-field">
                <label for="assetsUnderManagement">资产管理规模</label>
                <input
                  id="assetsUnderManagement"
                  v-model="formData.professionalInfo.assetsUnderManagement"
                  type="number"
                  min="0"
                  class="gvip-demo-input"
                  placeholder="适用于金融行业"
                />
              </div>

              <div class="gvip-demo-field gvip-demo-field--full">
                <label for="otherBusinessVolumeIndicator">其他年度业务量指标</label>
                <textarea
                  id="otherBusinessVolumeIndicator"
                  v-model="formData.professionalInfo.otherBusinessVolumeIndicator"
                  class="gvip-demo-textarea"
                  placeholder="请输入其他年度业务量指标"
                ></textarea>
              </div>

              <div class="gvip-demo-field">
                <label>是否为上市公司</label>
                <div class="gvip-demo-chip-group">
                  <label
                    v-for="option in listedCompanyOptions"
                    :key="`listed-${option.value}`"
                    class="gvip-demo-chip"
                    :class="{ 'is-selected': formData.professionalInfo.isListedCompany === option.value }"
                  >
                    <input
                      v-model="formData.professionalInfo.isListedCompany"
                      type="radio"
                      :value="option.value"
                    />
                    <span>{{ option.label }}</span>
                  </label>
                </div>
              </div>

              <div class="gvip-demo-field">
                <label for="listedStockExchange">证券交易所</label>
                <input
                  id="listedStockExchange"
                  v-model="formData.professionalInfo.listedStockExchange"
                  type="text"
                  class="gvip-demo-input"
                  :disabled="formData.professionalInfo.isListedCompany !== 'yes'"
                  placeholder="请输入证券交易所"
                />
              </div>

              <div class="gvip-demo-field">
                <label for="tickerSymbol">股票代码</label>
                <input
                  id="tickerSymbol"
                  v-model="formData.professionalInfo.tickerSymbol"
                  type="text"
                  class="gvip-demo-input"
                  :disabled="formData.professionalInfo.isListedCompany !== 'yes'"
                  placeholder="请输入股票代码"
                />
              </div>
            </div>
          </section>

          <section class="gvip-demo-form-card">
            <div class="gvip-demo-section-heading">
              <div>
                <h2>行业类别</h2>
                <p>Industry Category</p>
              </div>
            </div>

            <div class="gvip-demo-industry-grid">
              <label
                v-for="option in industryOptions"
                :key="option.value"
                class="gvip-demo-industry-card"
                :class="{ 'is-selected': formData.industryInfo.industryNumber === option.value }"
              >
                <input
                  v-model="formData.industryInfo.industryNumber"
                  type="radio"
                  :value="option.value"
                />
                <span class="gvip-demo-industry-card__number">{{ option.value }}</span>
                <strong>{{ option.cnLabel }}</strong>
                <small>{{ option.enLabel }}</small>
              </label>
            </div>

            <div class="gvip-demo-field gvip-demo-field--full">
              <label for="industryOther">其他说明 Other Please Specify</label>
              <input
                id="industryOther"
                v-model="formData.industryInfo.industryOther"
                type="text"
                class="gvip-demo-input"
                placeholder="如需补充，请填写行业说明"
              />
            </div>
          </section>

          <section class="gvip-demo-form-card">
            <div class="gvip-demo-section-heading">
              <div>
                <h2>工作履历</h2>
                <p>Work Experience</p>
              </div>

              <button type="button" class="gvip-demo-secondary-action" @click="addWorkExperience">
                + 添加工作履历
              </button>
            </div>

            <div class="gvip-demo-work-experience-list">
              <div
                v-for="(experience, index) in formData.workExperiences"
                :key="`desktop-work-${index}`"
                class="gvip-demo-work-experience-row"
              >
                <div class="gvip-demo-field">
                  <label :for="`work-dateRange-${index}`">起止时间（年/月）</label>
                  <input
                    :id="`work-dateRange-${index}`"
                    v-model="experience.dateRange"
                    type="text"
                    class="gvip-demo-input"
                    placeholder="如 2018/03 - 至今"
                  />
                </div>

                <div class="gvip-demo-field">
                  <label :for="`work-organization-${index}`">工作单位</label>
                  <input
                    :id="`work-organization-${index}`"
                    v-model="experience.organization"
                    type="text"
                    class="gvip-demo-input"
                    placeholder="请输入工作单位"
                  />
                </div>

                <div class="gvip-demo-field">
                  <label :for="`work-position-${index}`">担任职务</label>
                  <input
                    :id="`work-position-${index}`"
                    v-model="experience.position"
                    type="text"
                    class="gvip-demo-input"
                    placeholder="请输入担任职务"
                  />
                </div>

                <button type="button" class="gvip-demo-row-remove" @click="removeWorkExperience(index)">
                  删除
                </button>
              </div>
            </div>
          </section>

          <section class="gvip-demo-form-card">
            <div class="gvip-demo-section-heading">
              <div>
                <h2>企业简介</h2>
                <p>Organization Introduction</p>
              </div>
              <span class="gvip-demo-character-count">{{ organizationIntroductionCount }} / 1000</span>
            </div>

            <textarea
              v-model="formData.organizationIntroduction"
              class="gvip-demo-textarea gvip-demo-textarea--large"
              maxlength="1000"
              placeholder="请简要介绍您的企业，包括主营业务、市场地位、核心优势、发展阶段等。"
            ></textarea>
          </section>
        </template>

        <template v-else-if="currentStepIndex === 2">
          <section class="gvip-demo-form-card">
            <div class="gvip-demo-section-heading">
              <div>
                <h2>申请动机与发展目标</h2>
                <p>Motivation & Goals</p>
              </div>
            </div>

            <div class="gvip-demo-longform-stack">
              <div class="gvip-demo-question-block">
                <label for="applicationMotivation" class="gvip-demo-question-title">申请动机</label>
                <p class="gvip-demo-question-subtitle">
                  Please describe your motivation for applying to the GVIP program.
                </p>
                <textarea
                  id="applicationMotivation"
                  v-model="formData.otherInfo.applicationMotivation"
                  class="gvip-demo-textarea gvip-demo-textarea--large"
                  maxlength="1000"
                  placeholder="请说明您报名 GVIP 项目的主要原因。"
                ></textarea>
                <div class="gvip-demo-character-count">{{ applicationMotivationCount }} / 1000</div>
              </div>

              <div class="gvip-demo-question-block">
                <label for="developmentGoals" class="gvip-demo-question-title">发展目标</label>
                <p class="gvip-demo-question-subtitle">
                  What are your primary development goals for participating in this program?
                </p>
                <textarea
                  id="developmentGoals"
                  v-model="formData.otherInfo.developmentGoals"
                  class="gvip-demo-textarea gvip-demo-textarea--large"
                  maxlength="1000"
                  placeholder="请描述您希望通过本项目实现的职业或个人发展目标。"
                ></textarea>
                <div class="gvip-demo-character-count">{{ developmentGoalsCount }} / 1000</div>
              </div>
            </div>
          </section>

          <section class="gvip-demo-form-card">
            <div class="gvip-demo-section-heading">
              <div>
                <h2>主要成就和社会荣誉</h2>
                <p>Achievements & Honors</p>
              </div>
            </div>

            <div class="gvip-demo-question-block">
              <label for="achievements" class="gvip-demo-question-title">主要成就和社会荣誉</label>
              <p class="gvip-demo-question-subtitle">
                Please briefly describe your achievements, industry influence and honors.
              </p>
              <textarea
                id="achievements"
                v-model="formData.otherInfo.achievements"
                class="gvip-demo-textarea gvip-demo-textarea--large"
                maxlength="1200"
                placeholder="请简述您的主要职业成就、社会荣誉及行业影响力。"
              ></textarea>
              <div class="gvip-demo-character-count">{{ achievementsCount }} / 1200</div>
            </div>
          </section>

          <section class="gvip-demo-form-card">
            <div class="gvip-demo-section-heading">
              <div>
                <h2>其他院校申请与过往课程</h2>
                <p>Other Applications & Previous Programs</p>
              </div>
            </div>

            <div class="gvip-demo-longform-stack">
              <div class="gvip-demo-question-block">
                <label class="gvip-demo-question-title">是否同时申请其他院校课程</label>
                <p class="gvip-demo-question-subtitle">
                  Are you currently applying to or considering programs at other institutions?
                </p>
                <div class="gvip-demo-chip-group">
                  <label
                    v-for="option in listedCompanyOptions"
                    :key="`applying-${option.value}`"
                    class="gvip-demo-chip"
                    :class="{ 'is-selected': formData.otherInfo.applyingOtherPrograms === option.value }"
                  >
                    <input
                      v-model="formData.otherInfo.applyingOtherPrograms"
                      type="radio"
                      :value="option.value"
                    />
                    <span>{{ option.label }}</span>
                  </label>
                </div>

                <div v-if="formData.otherInfo.applyingOtherPrograms === 'yes'" class="gvip-demo-field">
                  <label for="applyingOtherProgramsDetail">请说明 Please Specify</label>
                  <input
                    id="applyingOtherProgramsDetail"
                    v-model="formData.otherInfo.applyingOtherProgramsDetail"
                    type="text"
                    class="gvip-demo-input"
                    placeholder="请填写正在申请或考虑的院校及课程名称"
                  />
                </div>
              </div>

              <div class="gvip-demo-question-block">
                <div class="gvip-demo-section-heading gvip-demo-section-heading--compact">
                  <div>
                    <label class="gvip-demo-question-title">是否参加过其他商学院培训课程</label>
                    <p class="gvip-demo-question-subtitle">
                      Have you previously participated in executive education programs at other business schools?
                    </p>
                  </div>
                  <button type="button" class="gvip-demo-secondary-action" @click="addPreviousProgram">
                    + 添加课程经历
                  </button>
                </div>

                <div class="gvip-demo-chip-group">
                  <label
                    v-for="option in listedCompanyOptions"
                    :key="`previous-${option.value}`"
                    class="gvip-demo-chip"
                    :class="{ 'is-selected': formData.otherInfo.participatedBusinessSchoolPrograms === option.value }"
                  >
                    <input
                      v-model="formData.otherInfo.participatedBusinessSchoolPrograms"
                      type="radio"
                      :value="option.value"
                    />
                    <span>{{ option.label }}</span>
                  </label>
                </div>

                <div
                  v-if="formData.otherInfo.participatedBusinessSchoolPrograms === 'yes'"
                  class="gvip-demo-field"
                >
                  <label for="participatedBusinessSchoolProgramsDetail">补充说明 Please Specify</label>
                  <input
                    id="participatedBusinessSchoolProgramsDetail"
                    v-model="formData.otherInfo.participatedBusinessSchoolProgramsDetail"
                    type="text"
                    class="gvip-demo-input"
                    placeholder="可补充参与课程的整体情况"
                  />
                </div>

                <div class="gvip-demo-previous-program-list">
                  <div
                    v-for="(program, index) in formData.otherInfo.previousPrograms"
                    :key="`program-${index}`"
                    class="gvip-demo-previous-program-row"
                  >
                    <div class="gvip-demo-field">
                      <label :for="`programTitle-${index}`">项目名称 Program Title</label>
                      <input
                        :id="`programTitle-${index}`"
                        v-model="program.programTitle"
                        type="text"
                        class="gvip-demo-input"
                        placeholder="请输入项目名称"
                      />
                    </div>

                    <div class="gvip-demo-field">
                      <label :for="`institution-${index}`">院校 Institution</label>
                      <input
                        :id="`institution-${index}`"
                        v-model="program.institution"
                        type="text"
                        class="gvip-demo-input"
                        placeholder="请输入院校名称"
                      />
                    </div>

                    <button type="button" class="gvip-demo-row-remove" @click="removePreviousProgram(index)">
                      删除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="gvip-demo-form-card">
            <div class="gvip-demo-section-heading">
              <div>
                <h2>兴趣爱好与项目参与意愿</h2>
                <p>Interests & Program Participation</p>
              </div>
            </div>

            <div class="gvip-demo-question-block">
              <label for="personalInterests" class="gvip-demo-question-title">兴趣爱好</label>
              <p class="gvip-demo-question-subtitle">Personal Interests</p>
              <textarea
                id="personalInterests"
                v-model="formData.otherInfo.personalInterests"
                class="gvip-demo-textarea"
                placeholder="请填写您的兴趣爱好"
              ></textarea>
            </div>

            <div class="gvip-demo-two-column-grid">
              <div class="gvip-demo-question-block">
                <label class="gvip-demo-question-title">是否愿意担任班委</label>
                <p class="gvip-demo-question-subtitle">
                  Would you be interested in serving in a class leadership role?
                </p>
                <div class="gvip-demo-chip-group">
                  <label
                    v-for="option in listedCompanyOptions"
                    :key="`leadership-${option.value}`"
                    class="gvip-demo-chip"
                    :class="{ 'is-selected': formData.otherInfo.interestedInClassLeadership === option.value }"
                  >
                    <input
                      v-model="formData.otherInfo.interestedInClassLeadership"
                      type="radio"
                      :value="option.value"
                    />
                    <span>{{ option.label }}</span>
                  </label>
                </div>
              </div>

              <div class="gvip-demo-question-block">
                <label class="gvip-demo-question-title">是否愿意接待参访活动</label>
                <p class="gvip-demo-question-subtitle">
                  Would you be willing to host or support program-related company visits or activities?
                </p>
                <div class="gvip-demo-chip-group">
                  <label
                    v-for="option in listedCompanyOptions"
                    :key="`host-${option.value}`"
                    class="gvip-demo-chip"
                    :class="{ 'is-selected': formData.otherInfo.willingToHostActivities === option.value }"
                  >
                    <input
                      v-model="formData.otherInfo.willingToHostActivities"
                      type="radio"
                      :value="option.value"
                    />
                    <span>{{ option.label }}</span>
                  </label>
                </div>
              </div>
            </div>
          </section>
        </template>

        <template v-else>
          <section class="gvip-demo-signature-grid">
            <article class="gvip-demo-form-card gvip-demo-signature-card">
              <div class="gvip-demo-stage-card__header">
                <h2>保密说明</h2>
                <p>Confidentiality Notice</p>
              </div>
              <div class="gvip-demo-signature-copy">
                <p>
                  您填写提交的报名资料将由招生办公室负责翻译发送至哥伦比亚大学商学院高管教育进行审核，我们确保，对以上您提供的个人信息严格保密。
                </p>
                <p>
                  Your application materials will be translated by the admissions office and
                  submitted to Columbia Business School Executive Education for evaluation. All
                  personal information provided will be treated with strict confidentiality.
                </p>
              </div>
              <label class="gvip-demo-check-card" :class="{ 'is-error': signatureErrors.confidentialityConfirmed }">
                <input
                  v-model="formData.signature.confidentialityConfirmed"
                  type="checkbox"
                />
                <span>我已阅读并理解以上保密说明。</span>
              </label>
              <small v-if="signatureErrors.confidentialityConfirmed" class="gvip-demo-error-text">
                {{ signatureErrors.confidentialityConfirmed }}
              </small>
            </article>

            <article class="gvip-demo-form-card gvip-demo-signature-card">
              <div class="gvip-demo-stage-card__header">
                <h2>电子签名</h2>
                <p>Electronic Signature</p>
              </div>
              <div class="gvip-demo-form-grid">
                <div class="gvip-demo-field gvip-demo-field--full">
                  <label for="applicantSignature">
                    申请人签名 Signature <span class="gvip-demo-required">*</span>
                  </label>
                  <input
                    id="applicantSignature"
                    v-model="formData.signature.applicantSignature"
                    type="text"
                    class="gvip-demo-input"
                    :class="{ 'is-error': signatureErrors.applicantSignature }"
                    placeholder="请输入申请人姓名作为电子签名"
                  />
                  <small v-if="signatureErrors.applicantSignature" class="gvip-demo-error-text">
                    {{ signatureErrors.applicantSignature }}
                  </small>
                </div>

                <div class="gvip-demo-field">
                  <label for="applicationDate">
                    申请日期 Date <span class="gvip-demo-required">*</span>
                  </label>
                  <input
                    id="applicationDate"
                    v-model="formData.signature.applicationDate"
                    type="date"
                    class="gvip-demo-input"
                    :class="{ 'is-error': signatureErrors.applicationDate }"
                  />
                  <small v-if="signatureErrors.applicationDate" class="gvip-demo-error-text">
                    {{ signatureErrors.applicationDate }}
                  </small>
                </div>

                <div class="gvip-demo-field gvip-demo-field--full">
                  <label class="gvip-demo-check-card" :class="{ 'is-error': signatureErrors.finalConfirmed }">
                    <input
                      v-model="formData.signature.finalConfirmed"
                      type="checkbox"
                    />
                    <span>我确认以上所有报名信息真实、准确、完整，并确认提交本次报名申请。</span>
                  </label>
                  <small v-if="signatureErrors.finalConfirmed" class="gvip-demo-error-text">
                    {{ signatureErrors.finalConfirmed }}
                  </small>
                </div>
              </div>
            </article>

            <article class="gvip-demo-form-card gvip-demo-signature-card gvip-demo-signature-card--full">
              <div class="gvip-demo-stage-card__header">
                <h2>申请人声明</h2>
                <p>Applicant Declaration</p>
              </div>
              <div class="gvip-demo-signature-copy">
                <p>
                  本人谨此声明：我所提交的所有资料信息均真实可靠完整。我同意在必要的情况下提交原件以确认我的报名资格。报名表中个人自述完全由我本人完成，并愿对因虚假资料导致的申请失败或学籍的取消承担全部责任。
                </p>
                <p>
                  我理解并同意报名材料归项目办公室所有，无论录取与否均不退回。
                </p>
                <p>
                  I certify that all information and materials submitted in this application are
                  true, accurate, and complete. I understand that original documentation may be
                  requested to verify my eligibility. I confirm that the personal statement
                  included in this application has been completed independently by me. I understand
                  that the submission of false or misleading information may result in the rejection
                  of my application or the revocation of admission.
                </p>
                <p>
                  I further understand and agree that all application materials submitted become the
                  property of the program office and will not be returned, regardless of the
                  admission decision.
                </p>
              </div>
              <label class="gvip-demo-check-card" :class="{ 'is-error': signatureErrors.declarationConfirmed }">
                <input
                  v-model="formData.signature.declarationConfirmed"
                  type="checkbox"
                />
                <span>我已阅读并同意以上申请人声明。</span>
              </label>
              <small v-if="signatureErrors.declarationConfirmed" class="gvip-demo-error-text">
                {{ signatureErrors.declarationConfirmed }}
              </small>
            </article>

            <article class="gvip-demo-form-card gvip-demo-signature-card gvip-demo-signature-card--full">
              <div class="gvip-demo-stage-card__header">
                <h2>提交与导出</h2>
                <p>Review & Export</p>
              </div>

              <div class="gvip-demo-review-status-list">
                <div
                  v-for="item in stageCompletionItems"
                  :key="item.title"
                  class="gvip-demo-review-status-item"
                >
                  <span>{{ item.title }}</span>
                  <strong :class="item.completed ? 'is-complete' : 'is-pending'">
                    {{ item.completed ? '已填写' : '待完善' }}
                  </strong>
                </div>
              </div>

              <div class="gvip-demo-review-actions">
                <button
                  type="button"
                  class="gvip-demo-action-button gvip-demo-action-button--dark"
                  @click="persistDraft('第四阶段草稿已保存。')"
                >
                  保存草稿
                </button>
                <button
                  type="button"
                  class="gvip-demo-action-button gvip-demo-action-button--outline"
                  @click="handlePreview"
                >
                  预览报名表
                </button>
                <button
                  type="button"
                  class="gvip-demo-action-button gvip-demo-action-button--gold"
                  @click="handleExport"
                >
                  导出 PDF
                </button>
                <button
                  type="button"
                  class="gvip-demo-action-button gvip-demo-action-button--ghost"
                  @click="handleClearDraft"
                >
                  清空草稿
                </button>
              </div>

              <section v-if="showPreview" class="gvip-demo-signature-preview-panel">
                <div class="gvip-demo-stage-card__header">
                  <h2>报名表预览</h2>
                  <p>PDF Preview</p>
                </div>
                <PdfPreview :form-data="formData" :industry-options="industryOptions" />
              </section>
            </article>
          </section>

          <div class="gvip-demo-pdf-export-surface" aria-hidden="true">
            <div ref="exportPreviewRef">
              <PdfPreview :form-data="formData" :industry-options="industryOptions" />
            </div>
          </div>
        </template>
      </section>
    </main>
  </div>
</template>
