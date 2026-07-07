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
  errors,
  formData,
  genderOptions,
  goToNextStep,
  goToPreviousStep,
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
const organizationIntroductionCount = computed(() => formData.organizationIntroduction.length)
const applicationMotivationCount = computed(() => formData.otherInfo.applicationMotivation.length)
const developmentGoalsCount = computed(() => formData.otherInfo.developmentGoals.length)
const achievementsCount = computed(() => formData.otherInfo.achievements.length)
const signatureErrors = computed(() => errors.signature || {})
const isFinalStep = computed(() => currentStepIndex.value === applicationSteps.length - 1)
const primaryButtonLabel = computed(() =>
  isFinalStep.value ? '导出 PDF' : '下一步',
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
    message: '已展开报名表预览，可先检查四个阶段内容。',
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
  <div class="gvip-demo gvip-demo--mobile">
    <header class="gvip-demo-mobile-header">
      <div class="gvip-demo-mobile-header__row">
        <div>
          <p class="gvip-demo-mobile-header__eyebrow">{{ currentStep.subtitle }}</p>
          <h1>{{ currentStep.title }}</h1>
        </div>
        <span class="gvip-demo-mobile-header__step">
          Step {{ currentStepIndex + 1 }} / {{ applicationSteps.length }}
        </span>
      </div>

      <div class="progress-track" aria-label="Application progress">
        <div class="progress-value" :style="{ width: `${progressPercent}%` }"></div>
      </div>
    </header>

    <main class="gvip-demo-mobile-content">
      <section
        v-if="notice.message"
        class="gvip-demo-inline-notice"
        :class="`is-${notice.type}`"
      >
        {{ notice.message }}
      </section>

      <template v-if="currentStepIndex === 0">
        <section class="gvip-demo-mobile-card">
          <div class="gvip-demo-mobile-card__heading">
            <h2>个人信息</h2>
            <p>Personal Information</p>
          </div>

          <div class="gvip-demo-field">
            <label>两寸免冠证件照</label>
            <input
              ref="photoInput"
              type="file"
              accept=".jpg,.jpeg,.png"
              class="gvip-demo-photo-card__input"
              @change="handlePhotoChange"
            />
            <button type="button" class="gvip-demo-mobile-upload" @click="triggerPhotoPicker">
              <span>点击上传证件照</span>
              <small>支持 JPG / PNG，建议白底证件照</small>
            </button>
            <div v-if="formData.personalInfo.idPhotoFileName" class="gvip-demo-photo-card__file">
              <span>{{ formData.personalInfo.idPhotoFileName }}</span>
              <button type="button" @click="handleRemovePhoto">删除</button>
            </div>
          </div>

          <div class="gvip-demo-field">
            <label>中文姓名 CN Name <span class="gvip-demo-required">*</span></label>
            <input
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
            <label>英文姓名 EN Name</label>
            <input
              v-model="formData.personalInfo.enName"
              type="text"
              class="gvip-demo-input"
              placeholder="请输入英文姓名"
            />
          </div>

          <div class="gvip-demo-field">
            <label>性别 Gender</label>
            <div class="gvip-demo-chip-group gvip-demo-chip-group--stacked">
              <label
                v-for="option in genderOptions"
                :key="option.value"
                class="gvip-demo-chip gvip-demo-chip--large"
                :class="{ 'is-selected': formData.personalInfo.gender === option.value }"
              >
                <input v-model="formData.personalInfo.gender" type="radio" :value="option.value" />
                <span>{{ option.label }}</span>
              </label>
            </div>
          </div>

          <div class="gvip-demo-field">
            <label>出生日期 Date of Birth</label>
            <input v-model="formData.personalInfo.dateOfBirth" type="date" class="gvip-demo-input" />
          </div>

          <div class="gvip-demo-field">
            <label>国籍 Nationality</label>
            <input
              v-model="formData.personalInfo.nationality"
              type="text"
              class="gvip-demo-input"
              placeholder="请输入国籍"
            />
          </div>

          <div class="gvip-demo-field">
            <label>出生地点 Country of Birth</label>
            <input
              v-model="formData.personalInfo.countryOfBirth"
              type="text"
              class="gvip-demo-input"
              placeholder="请输入出生地点"
            />
          </div>
        </section>

        <section class="gvip-demo-mobile-card">
          <div class="gvip-demo-mobile-card__heading">
            <h2>证件信息</h2>
            <p>Identity & Visa</p>
          </div>

          <div class="gvip-demo-field">
            <label>证件类型 Type of ID Document</label>
            <div class="gvip-demo-chip-group gvip-demo-chip-group--stacked">
              <label
                v-for="option in idDocumentTypeOptions"
                :key="option.value"
                class="gvip-demo-chip gvip-demo-chip--large gvip-demo-chip--multiline"
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

          <div v-if="formData.personalInfo.idDocumentType === 'other'" class="gvip-demo-field">
            <label>其他证件说明 Other Document Type <span class="gvip-demo-required">*</span></label>
            <input
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

          <div class="gvip-demo-field">
            <label>证件号码 ID Number</label>
            <input
              v-model="formData.personalInfo.idNumber"
              type="text"
              class="gvip-demo-input"
              placeholder="请输入证件号码"
            />
          </div>

          <div class="gvip-demo-field">
            <label>是否持有有效期内美国签证</label>
            <div class="gvip-demo-chip-group gvip-demo-chip-group--stacked">
              <label
                v-for="option in visaOptions"
                :key="option.value"
                class="gvip-demo-chip gvip-demo-chip--large"
                :class="{ 'is-selected': formData.personalInfo.hasUsVisa === option.value }"
              >
                <input v-model="formData.personalInfo.hasUsVisa" type="radio" :value="option.value" />
                <span>{{ option.label }}</span>
              </label>
            </div>
          </div>

          <div class="gvip-demo-field">
            <label>签证到期时间 Visa Expiration Date</label>
            <input
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
        </section>

        <section class="gvip-demo-mobile-card">
          <div class="gvip-demo-mobile-card__heading">
            <h2>联系方式</h2>
            <p>Contact Details</p>
          </div>

          <div class="gvip-demo-field">
            <label>办公电话 Work Phone</label>
            <input
              v-model="formData.personalInfo.workPhone"
              type="text"
              class="gvip-demo-input"
              placeholder="请输入办公电话"
            />
          </div>

          <div class="gvip-demo-field">
            <label>手机号码 Mobile Phone <span class="gvip-demo-required">*</span></label>
            <input
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
            <label>电子邮箱 Email <span class="gvip-demo-required">*</span></label>
            <input
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

          <div class="gvip-demo-field">
            <label>通讯地址 Address</label>
            <input
              v-model="formData.personalInfo.address"
              type="text"
              class="gvip-demo-input"
              placeholder="请输入通讯地址"
            />
          </div>

          <div class="gvip-demo-field">
            <label>衣服尺码 Clothing Size</label>
            <select v-model="formData.personalInfo.clothingSize" class="gvip-demo-input">
              <option value="">请选择衣服尺码</option>
              <option v-for="option in clothingSizeOptions" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </div>

          <div class="gvip-demo-field">
            <label>LinkedIn账号 LinkedIn Account</label>
            <input
              v-model="formData.personalInfo.linkedin"
              type="text"
              class="gvip-demo-input"
              placeholder="请输入 LinkedIn 账号或链接"
            />
          </div>
        </section>

        <section class="gvip-demo-mobile-card">
          <div class="gvip-demo-mobile-card__heading">
            <h2>指定联系人</h2>
            <p>Designated Contact Person</p>
          </div>

          <div class="gvip-demo-field">
            <label>中文姓名 CN Name</label>
            <input
              v-model="formData.contactPerson.cnName"
              type="text"
              class="gvip-demo-input"
              placeholder="请输入联系人中文姓名"
            />
          </div>

          <div class="gvip-demo-field">
            <label>英文姓名 EN Name</label>
            <input
              v-model="formData.contactPerson.enName"
              type="text"
              class="gvip-demo-input"
              placeholder="请输入联系人英文姓名"
            />
          </div>

          <div class="gvip-demo-field">
            <label>性别 Gender</label>
            <div class="gvip-demo-chip-group gvip-demo-chip-group--stacked">
              <label
                v-for="option in genderOptions"
                :key="`contact-${option.value}`"
                class="gvip-demo-chip gvip-demo-chip--large"
                :class="{ 'is-selected': formData.contactPerson.gender === option.value }"
              >
                <input v-model="formData.contactPerson.gender" type="radio" :value="option.value" />
                <span>{{ option.label }}</span>
              </label>
            </div>
          </div>

          <div class="gvip-demo-field">
            <label>与申请人关系 Relationship</label>
            <input
              v-model="formData.contactPerson.relationship"
              type="text"
              class="gvip-demo-input"
              placeholder="如：助理、配偶、同事等"
            />
          </div>

          <div class="gvip-demo-field">
            <label>手机号码 Mobile Phone</label>
            <input
              v-model="formData.contactPerson.mobilePhone"
              type="text"
              class="gvip-demo-input"
              placeholder="请输入联系人手机号"
            />
          </div>

          <div class="gvip-demo-field">
            <label>电子邮箱 Email</label>
            <input
              v-model="formData.contactPerson.email"
              type="email"
              class="gvip-demo-input"
              placeholder="请输入联系人邮箱"
            />
          </div>
        </section>
      </template>

      <template v-else-if="currentStepIndex === 1">
        <section class="gvip-demo-mobile-card">
          <div class="gvip-demo-mobile-card__heading">
            <h2>工作背景</h2>
            <p>Professional Information</p>
          </div>

          <div class="gvip-demo-field">
            <label>全职工作时间</label>
            <input
              v-model="formData.professionalInfo.totalWorkYears"
              type="number"
              min="0"
              class="gvip-demo-input"
              placeholder="单位：年"
            />
          </div>

          <div class="gvip-demo-field">
            <label>担任管理工作时间</label>
            <input
              v-model="formData.professionalInfo.managementYears"
              type="number"
              min="0"
              class="gvip-demo-input"
              placeholder="单位：年"
            />
          </div>

          <div class="gvip-demo-field">
            <label>在目前机构担任工作年限</label>
            <input
              v-model="formData.professionalInfo.currentOrganizationYears"
              type="number"
              min="0"
              class="gvip-demo-input"
              placeholder="单位：年"
            />
          </div>

          <div class="gvip-demo-field">
            <label>职务 Position</label>
            <input
              v-model="formData.professionalInfo.position"
              type="text"
              class="gvip-demo-input"
              placeholder="请输入职务"
            />
          </div>

          <div class="gvip-demo-field">
            <label>雇员人数 Number of Employees</label>
            <input
              v-model="formData.professionalInfo.employeeCount"
              type="number"
              min="0"
              class="gvip-demo-input"
              placeholder="请输入雇员人数"
            />
          </div>
        </section>

        <section class="gvip-demo-mobile-card">
          <div class="gvip-demo-mobile-card__heading">
            <h2>企业信息</h2>
            <p>Organization Information</p>
          </div>

          <div class="gvip-demo-field">
            <label>现任单位名称中文</label>
            <input
              v-model="formData.professionalInfo.organizationNameCn"
              type="text"
              class="gvip-demo-input"
              placeholder="请输入单位中文名称"
            />
          </div>

          <div class="gvip-demo-field">
            <label>现任单位名称英文</label>
            <input
              v-model="formData.professionalInfo.organizationNameEn"
              type="text"
              class="gvip-demo-input"
              placeholder="请输入单位英文名称"
            />
          </div>

          <div class="gvip-demo-field">
            <label>现任单位网址 Website</label>
            <input
              v-model="formData.professionalInfo.website"
              type="text"
              class="gvip-demo-input"
              placeholder="请输入公司网址"
            />
          </div>

          <div class="gvip-demo-field">
            <label>企业性质 Type of Organization</label>
            <div class="gvip-demo-chip-group gvip-demo-chip-group--stacked">
              <label
                v-for="option in organizationTypeOptions"
                :key="option.value"
                class="gvip-demo-chip gvip-demo-chip--large gvip-demo-chip--multiline"
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
            <label>企业性质其他说明</label>
            <input
              v-model="formData.professionalInfo.organizationTypeOther"
              type="text"
              class="gvip-demo-input"
              placeholder="请输入其他企业性质"
            />
          </div>

          <div class="gvip-demo-field">
            <label>公司资产</label>
            <input
              v-model="formData.professionalInfo.totalAssets"
              type="number"
              min="0"
              class="gvip-demo-input"
              placeholder="单位：亿人民币"
            />
          </div>

          <div class="gvip-demo-field">
            <label>公司上年销售额</label>
            <input
              v-model="formData.professionalInfo.annualRevenue"
              type="number"
              min="0"
              class="gvip-demo-input"
              placeholder="单位：亿人民币"
            />
          </div>

          <div class="gvip-demo-field">
            <label>公司上年度利润额</label>
            <input
              v-model="formData.professionalInfo.annualProfit"
              type="number"
              min="0"
              class="gvip-demo-input"
              placeholder="单位：亿人民币"
            />
          </div>

          <div class="gvip-demo-field">
            <label>资产管理规模</label>
            <input
              v-model="formData.professionalInfo.assetsUnderManagement"
              type="number"
              min="0"
              class="gvip-demo-input"
              placeholder="适用于金融行业"
            />
          </div>

          <div class="gvip-demo-field">
            <label>其他年度业务量指标</label>
            <textarea
              v-model="formData.professionalInfo.otherBusinessVolumeIndicator"
              class="gvip-demo-textarea"
              placeholder="请输入其他年度业务量指标"
            ></textarea>
          </div>

          <div class="gvip-demo-field">
            <label>是否为上市公司</label>
            <div class="gvip-demo-chip-group gvip-demo-chip-group--stacked">
              <label
                v-for="option in listedCompanyOptions"
                :key="option.value"
                class="gvip-demo-chip gvip-demo-chip--large"
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
            <label>证券交易所</label>
            <input
              v-model="formData.professionalInfo.listedStockExchange"
              type="text"
              class="gvip-demo-input"
              :disabled="formData.professionalInfo.isListedCompany !== 'yes'"
              placeholder="请输入证券交易所"
            />
          </div>

          <div class="gvip-demo-field">
            <label>股票代码</label>
            <input
              v-model="formData.professionalInfo.tickerSymbol"
              type="text"
              class="gvip-demo-input"
              :disabled="formData.professionalInfo.isListedCompany !== 'yes'"
              placeholder="请输入股票代码"
            />
          </div>
        </section>

        <section class="gvip-demo-mobile-card">
          <div class="gvip-demo-mobile-card__heading">
            <h2>行业类别</h2>
            <p>Industry Category</p>
          </div>

          <div class="gvip-demo-industry-grid gvip-demo-industry-grid--mobile">
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

          <div class="gvip-demo-field">
            <label>其他说明 Other Please Specify</label>
            <input
              v-model="formData.industryInfo.industryOther"
              type="text"
              class="gvip-demo-input"
              placeholder="如需补充，请填写行业说明"
            />
          </div>
        </section>

        <section class="gvip-demo-mobile-card">
          <div class="gvip-demo-mobile-card__heading">
            <h2>工作履历</h2>
            <p>Work Experience</p>
          </div>

          <div class="gvip-demo-mobile-experience-list">
            <div
              v-for="(experience, index) in formData.workExperiences"
              :key="`mobile-work-${index}`"
              class="gvip-demo-mobile-experience-card"
            >
              <div class="gvip-demo-field">
                <label>起止时间（年/月）</label>
                <input
                  v-model="experience.dateRange"
                  type="text"
                  class="gvip-demo-input"
                  placeholder="如 2018/03 - 至今"
                />
              </div>

              <div class="gvip-demo-field">
                <label>工作单位</label>
                <input
                  v-model="experience.organization"
                  type="text"
                  class="gvip-demo-input"
                  placeholder="请输入工作单位"
                />
              </div>

              <div class="gvip-demo-field">
                <label>担任职务</label>
                <input
                  v-model="experience.position"
                  type="text"
                  class="gvip-demo-input"
                  placeholder="请输入担任职务"
                />
              </div>

              <button
                type="button"
                class="gvip-demo-row-remove gvip-demo-row-remove--mobile"
                @click="removeWorkExperience(index)"
              >
                删除此条履历
              </button>
            </div>
          </div>

          <button type="button" class="gvip-demo-mobile-add" @click="addWorkExperience">
            + 添加工作履历
          </button>
        </section>

        <section class="gvip-demo-mobile-card">
          <div class="gvip-demo-mobile-card__heading">
            <h2>企业简介</h2>
            <p>Organization Introduction</p>
          </div>

          <textarea
            v-model="formData.organizationIntroduction"
            class="gvip-demo-textarea gvip-demo-textarea--large"
            maxlength="1000"
            placeholder="请简要介绍您的企业，包括主营业务、市场地位、核心优势、发展阶段等。"
          ></textarea>

          <div class="gvip-demo-character-count">{{ organizationIntroductionCount }} / 1000</div>
        </section>
      </template>

      <template v-else-if="currentStepIndex === 2">
        <section class="gvip-demo-mobile-card">
          <div class="gvip-demo-mobile-card__heading">
            <h2>申请动机与发展目标</h2>
            <p>Motivation & Goals</p>
          </div>

          <div class="gvip-demo-question-block">
            <label class="gvip-demo-question-title">申请动机</label>
            <p class="gvip-demo-question-subtitle">
              Please describe your motivation for applying to the GVIP program.
            </p>
            <textarea
              v-model="formData.otherInfo.applicationMotivation"
              class="gvip-demo-textarea gvip-demo-textarea--large"
              maxlength="1000"
              placeholder="请说明您报名 GVIP 项目的主要原因。"
            ></textarea>
            <div class="gvip-demo-character-count">{{ applicationMotivationCount }} / 1000</div>
          </div>

          <div class="gvip-demo-question-block">
            <label class="gvip-demo-question-title">发展目标</label>
            <p class="gvip-demo-question-subtitle">
              What are your primary development goals for participating in this program?
            </p>
            <textarea
              v-model="formData.otherInfo.developmentGoals"
              class="gvip-demo-textarea gvip-demo-textarea--large"
              maxlength="1000"
              placeholder="请描述您希望通过本项目实现的职业或个人发展目标。"
            ></textarea>
            <div class="gvip-demo-character-count">{{ developmentGoalsCount }} / 1000</div>
          </div>
        </section>

        <section class="gvip-demo-mobile-card">
          <div class="gvip-demo-mobile-card__heading">
            <h2>主要成就和社会荣誉</h2>
            <p>Achievements & Honors</p>
          </div>

          <div class="gvip-demo-question-block">
            <label class="gvip-demo-question-title">主要成就和社会荣誉</label>
            <p class="gvip-demo-question-subtitle">
              Please briefly describe your achievements, industry influence and honors.
            </p>
            <textarea
              v-model="formData.otherInfo.achievements"
              class="gvip-demo-textarea gvip-demo-textarea--large"
              maxlength="1200"
              placeholder="请简述您的主要职业成就、社会荣誉及行业影响力。"
            ></textarea>
            <div class="gvip-demo-character-count">{{ achievementsCount }} / 1200</div>
          </div>
        </section>

        <section class="gvip-demo-mobile-card">
          <div class="gvip-demo-mobile-card__heading">
            <h2>其他院校申请与过往课程</h2>
            <p>Other Applications & Previous Programs</p>
          </div>

          <div class="gvip-demo-question-block">
            <label class="gvip-demo-question-title">是否同时申请其他院校课程</label>
            <p class="gvip-demo-question-subtitle">
              Are you currently applying to or considering programs at other institutions?
            </p>
            <div class="gvip-demo-chip-group gvip-demo-chip-group--stacked">
              <label
                v-for="option in listedCompanyOptions"
                :key="`mobile-applying-${option.value}`"
                class="gvip-demo-chip gvip-demo-chip--large"
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
              <label>请说明 Please Specify</label>
              <input
                v-model="formData.otherInfo.applyingOtherProgramsDetail"
                type="text"
                class="gvip-demo-input"
                placeholder="请填写正在申请或考虑的院校及课程名称"
              />
            </div>
          </div>

          <div class="gvip-demo-question-block">
            <div class="gvip-demo-mobile-card__heading gvip-demo-mobile-card__heading--compact">
              <div>
                <h2>过往商学院课程</h2>
                <p>Previous Programs</p>
              </div>
              <button type="button" class="gvip-demo-mobile-add" @click="addPreviousProgram">
                + 添加课程经历
              </button>
            </div>

            <label class="gvip-demo-question-title">是否参加过其他商学院培训课程</label>
            <p class="gvip-demo-question-subtitle">
              Have you previously participated in executive education programs at other business schools?
            </p>
            <div class="gvip-demo-chip-group gvip-demo-chip-group--stacked">
              <label
                v-for="option in listedCompanyOptions"
                :key="`mobile-previous-${option.value}`"
                class="gvip-demo-chip gvip-demo-chip--large"
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

            <div v-if="formData.otherInfo.participatedBusinessSchoolPrograms === 'yes'" class="gvip-demo-field">
              <label>补充说明 Please Specify</label>
              <input
                v-model="formData.otherInfo.participatedBusinessSchoolProgramsDetail"
                type="text"
                class="gvip-demo-input"
                placeholder="可补充参与课程的整体情况"
              />
            </div>

            <div class="gvip-demo-mobile-experience-list">
              <div
                v-for="(program, index) in formData.otherInfo.previousPrograms"
                :key="`mobile-program-${index}`"
                class="gvip-demo-mobile-experience-card"
              >
                <div class="gvip-demo-field">
                  <label>项目名称 Program Title</label>
                  <input
                    v-model="program.programTitle"
                    type="text"
                    class="gvip-demo-input"
                    placeholder="请输入项目名称"
                  />
                </div>

                <div class="gvip-demo-field">
                  <label>院校 Institution</label>
                  <input
                    v-model="program.institution"
                    type="text"
                    class="gvip-demo-input"
                    placeholder="请输入院校名称"
                  />
                </div>

                <button
                  type="button"
                  class="gvip-demo-row-remove gvip-demo-row-remove--mobile"
                  @click="removePreviousProgram(index)"
                >
                  删除此条课程
                </button>
              </div>
            </div>
          </div>
        </section>

        <section class="gvip-demo-mobile-card">
          <div class="gvip-demo-mobile-card__heading">
            <h2>兴趣爱好与项目参与意愿</h2>
            <p>Interests & Program Participation</p>
          </div>

          <div class="gvip-demo-question-block">
            <label class="gvip-demo-question-title">兴趣爱好</label>
            <p class="gvip-demo-question-subtitle">Personal Interests</p>
            <textarea
              v-model="formData.otherInfo.personalInterests"
              class="gvip-demo-textarea"
              placeholder="请填写您的兴趣爱好"
            ></textarea>
          </div>

          <div class="gvip-demo-question-block">
            <label class="gvip-demo-question-title">是否愿意担任班委</label>
            <p class="gvip-demo-question-subtitle">
              Would you be interested in serving in a class leadership role?
            </p>
            <div class="gvip-demo-chip-group gvip-demo-chip-group--stacked">
              <label
                v-for="option in listedCompanyOptions"
                :key="`mobile-leadership-${option.value}`"
                class="gvip-demo-chip gvip-demo-chip--large"
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
            <div class="gvip-demo-chip-group gvip-demo-chip-group--stacked">
              <label
                v-for="option in listedCompanyOptions"
                :key="`mobile-host-${option.value}`"
                class="gvip-demo-chip gvip-demo-chip--large"
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
        </section>
      </template>

      <template v-else>
        <section class="gvip-demo-mobile-card gvip-demo-stage-card">
          <div class="gvip-demo-mobile-card__heading">
            <h2>保密说明</h2>
            <p>Confidentiality Notice</p>
          </div>
          <div class="gvip-demo-signature-copy gvip-demo-signature-copy--mobile">
            <p>
              您填写提交的报名资料将由招生办公室负责翻译发送至哥伦比亚大学商学院高管教育进行审核，我们确保，对以上您提供的个人信息严格保密。
            </p>
            <p>
              Your application materials will be translated by the admissions office and submitted
              to Columbia Business School Executive Education for evaluation. All personal
              information provided will be treated with strict confidentiality.
            </p>
          </div>
          <label class="gvip-demo-check-card gvip-demo-check-card--mobile" :class="{ 'is-error': signatureErrors.confidentialityConfirmed }">
            <input
              v-model="formData.signature.confidentialityConfirmed"
              type="checkbox"
            />
            <span>我已阅读并理解以上保密说明。</span>
          </label>
          <small v-if="signatureErrors.confidentialityConfirmed" class="gvip-demo-error-text">
            {{ signatureErrors.confidentialityConfirmed }}
          </small>
        </section>

        <section class="gvip-demo-mobile-card gvip-demo-stage-card">
          <div class="gvip-demo-mobile-card__heading">
            <h2>申请人声明</h2>
            <p>Applicant Declaration</p>
          </div>
          <div class="gvip-demo-signature-copy gvip-demo-signature-copy--mobile">
            <p>
              本人谨此声明：我所提交的所有资料信息均真实可靠完整。我同意在必要的情况下提交原件以确认我的报名资格。报名表中个人自述完全由我本人完成，并愿对因虚假资料导致的申请失败或学籍的取消承担全部责任。
            </p>
            <p>我理解并同意报名材料归项目办公室所有，无论录取与否均不退回。</p>
            <p>
              I certify that all information and materials submitted in this application are true,
              accurate, and complete. I understand that original documentation may be requested to
              verify my eligibility. I confirm that the personal statement included in this
              application has been completed independently by me.
            </p>
            <p>
              I further understand and agree that all application materials submitted become the
              property of the program office and will not be returned, regardless of the admission
              decision.
            </p>
          </div>
          <label class="gvip-demo-check-card gvip-demo-check-card--mobile" :class="{ 'is-error': signatureErrors.declarationConfirmed }">
            <input
              v-model="formData.signature.declarationConfirmed"
              type="checkbox"
            />
            <span>我已阅读并同意以上申请人声明。</span>
          </label>
          <small v-if="signatureErrors.declarationConfirmed" class="gvip-demo-error-text">
            {{ signatureErrors.declarationConfirmed }}
          </small>
        </section>

        <section class="gvip-demo-mobile-card gvip-demo-stage-card">
          <div class="gvip-demo-mobile-card__heading">
            <h2>电子签名</h2>
            <p>Electronic Signature</p>
          </div>
          <div class="gvip-demo-field">
            <label>
              申请人签名 Signature <span class="gvip-demo-required">*</span>
            </label>
            <input
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
            <label>
              申请日期 Date <span class="gvip-demo-required">*</span>
            </label>
            <input
              v-model="formData.signature.applicationDate"
              type="date"
              class="gvip-demo-input"
              :class="{ 'is-error': signatureErrors.applicationDate }"
            />
            <small v-if="signatureErrors.applicationDate" class="gvip-demo-error-text">
              {{ signatureErrors.applicationDate }}
            </small>
          </div>
          <div class="gvip-demo-field">
            <label class="gvip-demo-check-card gvip-demo-check-card--mobile" :class="{ 'is-error': signatureErrors.finalConfirmed }">
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
        </section>

        <section class="gvip-demo-mobile-card gvip-demo-stage-card">
          <div class="gvip-demo-mobile-card__heading">
            <h2>提交与导出</h2>
            <p>Review & Export</p>
          </div>

          <div class="gvip-demo-review-status-list gvip-demo-review-status-list--mobile">
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

          <div class="gvip-demo-review-actions gvip-demo-review-actions--mobile">
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
              class="gvip-demo-action-button gvip-demo-action-button--ghost"
              @click="handleClearDraft"
            >
              清空草稿
            </button>
          </div>

          <section v-if="showPreview" class="gvip-demo-signature-preview-panel gvip-demo-signature-preview-panel--mobile">
            <div class="gvip-demo-mobile-card__heading">
              <h2>报名表预览</h2>
              <p>PDF Preview</p>
            </div>
            <PdfPreview :form-data="formData" :industry-options="industryOptions" />
          </section>
        </section>

        <div class="gvip-demo-pdf-export-surface" aria-hidden="true">
          <div ref="exportPreviewRef">
            <PdfPreview :form-data="formData" :industry-options="industryOptions" />
          </div>
        </div>
      </template>
    </main>

    <footer class="gvip-demo-mobile-footer">
      <button
        type="button"
        class="gvip-demo-mobile-footer__button gvip-demo-mobile-footer__button--ghost"
        :disabled="currentStepIndex === 0"
        @click="goToPreviousStep"
      >
        上一步
      </button>
      <button
        type="button"
        class="gvip-demo-mobile-footer__button gvip-demo-mobile-footer__button--secondary"
        @click="persistDraft(isFinalStep ? '签名确认草稿已保存。' : '草稿已保存。')"
      >
        保存草稿
      </button>
      <button
        type="button"
        class="gvip-demo-mobile-footer__button gvip-demo-mobile-footer__button--primary"
        @click="handlePrimaryAction"
      >
        {{ primaryButtonLabel }}
      </button>
    </footer>
  </div>
</template>
