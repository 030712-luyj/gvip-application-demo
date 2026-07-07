import { computed, onMounted, reactive, ref } from 'vue'
import {
  applicationSteps,
  clothingSizeOptions,
  createInitialFormData,
  createInitialPreviousProgram,
  createInitialWorkExperience,
  genderOptions,
  idDocumentTypeOptions,
  listedCompanyOptions,
  organizationTypeOptions,
  visaOptions,
} from '../config/applicationSchema'
import { industryOptions } from '../config/industryOptions'
import { clearDraft, loadDraft, saveDraft } from './storage'

function createEmptyErrors() {
  return {
    personalInfo: {},
    contactPerson: {},
    professionalInfo: {},
    industryInfo: {},
    organizationIntroduction: '',
    otherInfo: {},
    signature: {},
  }
}

function cloneFormData(formData) {
  return JSON.parse(JSON.stringify(formData))
}

function mergeSection(targetSection, sourceSection) {
  if (!sourceSection) return

  Object.keys(targetSection).forEach((key) => {
    if (!Object.hasOwn(sourceSection, key)) return

    const targetType = typeof targetSection[key]
    const sourceType = typeof sourceSection[key]

    if (targetType === sourceType && (targetType === 'string' || targetType === 'boolean')) {
      targetSection[key] = sourceSection[key]
    }
  })
}

function mergeWorkExperiences(sourceExperiences) {
  if (!Array.isArray(sourceExperiences) || sourceExperiences.length === 0) {
    return [createInitialWorkExperience()]
  }

  return sourceExperiences.map((item) => ({
    dateRange: typeof item?.dateRange === 'string' ? item.dateRange : '',
    organization: typeof item?.organization === 'string' ? item.organization : '',
    position: typeof item?.position === 'string' ? item.position : '',
  }))
}

function mergePreviousPrograms(sourcePrograms) {
  if (!Array.isArray(sourcePrograms) || sourcePrograms.length === 0) {
    return [createInitialPreviousProgram(), createInitialPreviousProgram()]
  }

  return sourcePrograms.map((item) => ({
    programTitle: typeof item?.programTitle === 'string' ? item.programTitle : '',
    institution: typeof item?.institution === 'string' ? item.institution : '',
  }))
}

export function useApplicationForm() {
  const formData = reactive(createInitialFormData())
  const errors = reactive(createEmptyErrors())
  const notice = ref({
    type: '',
    message: '',
  })
  const currentStepIndex = ref(0)

  const currentStep = computed(() => applicationSteps[currentStepIndex.value])
  const progressPercent = computed(() =>
    Math.round(((currentStepIndex.value + 1) / applicationSteps.length) * 100),
  )

  const dismissNotice = () => {
    notice.value = {
      type: '',
      message: '',
    }
  }

  const setNotice = (type, message) => {
    notice.value = { type, message }
  }

  const getToday = () => new Date().toISOString().slice(0, 10)

  const ensureSignatureDefaults = () => {
    if (!formData.signature.applicationDate) {
      formData.signature.applicationDate = getToday()
    }
  }

  const clearErrors = () => {
    errors.personalInfo = {}
    errors.contactPerson = {}
    errors.professionalInfo = {}
    errors.industryInfo = {}
    errors.organizationIntroduction = ''
    errors.otherInfo = {}
    errors.signature = {}
  }

  const validateStepOne = () => {
    clearErrors()
    dismissNotice()

    const nextErrors = createEmptyErrors()

    if (!formData.personalInfo.cnName.trim()) {
      nextErrors.personalInfo.cnName = '请输入中文姓名'
    }

    if (!formData.personalInfo.mobilePhone.trim()) {
      nextErrors.personalInfo.mobilePhone = '请输入手机号码'
    }

    if (!formData.personalInfo.email.trim()) {
      nextErrors.personalInfo.email = '请输入电子邮箱'
    } else if (!formData.personalInfo.email.includes('@')) {
      nextErrors.personalInfo.email = '请输入有效的电子邮箱'
    }

    if (formData.personalInfo.idDocumentType === 'other' && !formData.personalInfo.idDocumentOther.trim()) {
      nextErrors.personalInfo.idDocumentOther = '请输入其他证件说明'
    }

    if (formData.personalInfo.hasUsVisa === 'yes' && !formData.personalInfo.visaExpirationDate) {
      nextErrors.personalInfo.visaExpirationDate = '请选择签证到期时间'
    }

    errors.personalInfo = nextErrors.personalInfo
    errors.contactPerson = nextErrors.contactPerson

    const hasError =
      Object.keys(nextErrors.personalInfo).length > 0 ||
      Object.keys(nextErrors.contactPerson).length > 0

    if (hasError) {
      setNotice('error', '请先完善中文姓名、手机号码、邮箱等必填信息后再继续。')
      return false
    }

    return true
  }

  const persistDraft = (message = '草稿已保存') => {
    saveDraft({
      currentStepIndex: currentStepIndex.value,
      formData: cloneFormData(formData),
    })

    setNotice('success', message)
  }

  const addWorkExperience = () => {
    formData.workExperiences.push(createInitialWorkExperience())
    dismissNotice()
  }

  const removeWorkExperience = (index) => {
    if (formData.workExperiences.length === 1) {
      formData.workExperiences.splice(0, 1, createInitialWorkExperience())
      return
    }

    formData.workExperiences.splice(index, 1)
  }

  const addPreviousProgram = () => {
    formData.otherInfo.previousPrograms.push(createInitialPreviousProgram())
    dismissNotice()
  }

  const removePreviousProgram = (index) => {
    if (formData.otherInfo.previousPrograms.length === 1) {
      formData.otherInfo.previousPrograms.splice(0, 1, createInitialPreviousProgram())
      return
    }

    formData.otherInfo.previousPrograms.splice(index, 1)
  }

  const validateFinalExport = () => {
    clearErrors()
    dismissNotice()

    const nextErrors = createEmptyErrors()

    if (!formData.personalInfo.cnName.trim()) {
      nextErrors.personalInfo.cnName = '请输入中文姓名'
    }

    if (!formData.personalInfo.mobilePhone.trim()) {
      nextErrors.personalInfo.mobilePhone = '请输入手机号码'
    }

    if (!formData.personalInfo.email.trim()) {
      nextErrors.personalInfo.email = '请输入电子邮箱'
    } else if (!formData.personalInfo.email.includes('@')) {
      nextErrors.personalInfo.email = '请输入有效的电子邮箱'
    }

    if (!formData.signature.applicantSignature.trim()) {
      nextErrors.signature.applicantSignature = '请输入申请人电子签名'
    }

    if (!formData.signature.applicationDate) {
      nextErrors.signature.applicationDate = '请选择申请日期'
    }

    if (!formData.signature.confidentialityConfirmed) {
      nextErrors.signature.confidentialityConfirmed = '请先确认保密说明'
    }

    if (!formData.signature.declarationConfirmed) {
      nextErrors.signature.declarationConfirmed = '请先确认申请人声明'
    }

    if (!formData.signature.finalConfirmed) {
      nextErrors.signature.finalConfirmed = '请先完成最终提交确认'
    }

    errors.personalInfo = nextErrors.personalInfo
    errors.signature = nextErrors.signature

    const hasError =
      Object.keys(nextErrors.personalInfo).length > 0 ||
      Object.keys(nextErrors.signature).length > 0

    if (hasError) {
      setNotice('error', '请完成签名确认后再导出 PDF。')
      return false
    }

    return true
  }

  const resetApplicationForm = () => {
    const nextFormData = createInitialFormData()

    Object.keys(nextFormData).forEach((key) => {
      formData[key] = nextFormData[key]
    })

    currentStepIndex.value = 0
    clearErrors()
    clearDraft()
    setNotice('success', '本地草稿已清空，表单已重置。')
  }

  const goToStep = (index) => {
    if (index < 0 || index >= applicationSteps.length) return

    if (index > 0 && currentStepIndex.value === 0 && !validateStepOne()) return

    currentStepIndex.value = index
    if (currentStepIndex.value === applicationSteps.length - 1) {
      ensureSignatureDefaults()
    }
    dismissNotice()
  }

  const goToNextStep = () => {
    if (currentStepIndex.value === 0 && !validateStepOne()) {
      return false
    }

    if (currentStepIndex.value < applicationSteps.length - 1) {
      currentStepIndex.value += 1
      if (currentStepIndex.value === applicationSteps.length - 1) {
        ensureSignatureDefaults()
      }
      persistDraft('已保存当前进度并进入下一阶段。')
    }

    return true
  }

  const goToPreviousStep = () => {
    if (currentStepIndex.value > 0) {
      currentStepIndex.value -= 1
      dismissNotice()
    }
  }

  const setPhotoFile = (file) => {
    if (!file) {
      formData.personalInfo.idPhotoFileName = ''
      return
    }

    const validExtensions = ['jpg', 'jpeg', 'png']
    const extension = file.name.split('.').pop()?.toLowerCase() || ''

    if (!validExtensions.includes(extension)) {
      setNotice('error', '证件照仅支持 JPG / JPEG / PNG 格式。')
      return
    }

    formData.personalInfo.idPhotoFileName = file.name
    setNotice('success', '证件照文件名已保存到当前草稿。')
  }

  const removePhotoFile = () => {
    formData.personalInfo.idPhotoFileName = ''
    dismissNotice()
  }

  onMounted(() => {
    const draft = loadDraft()

    if (!draft) return

    if (draft.formData) {
      mergeSection(formData.personalInfo, draft.formData.personalInfo)
      mergeSection(formData.contactPerson, draft.formData.contactPerson)
      mergeSection(formData.professionalInfo, draft.formData.professionalInfo)
      mergeSection(formData.industryInfo, draft.formData.industryInfo)
      formData.workExperiences = mergeWorkExperiences(draft.formData.workExperiences)
      formData.organizationIntroduction =
        typeof draft.formData.organizationIntroduction === 'string'
          ? draft.formData.organizationIntroduction
          : ''
      mergeSection(formData.otherInfo, draft.formData.otherInfo)
      formData.otherInfo.previousPrograms = mergePreviousPrograms(
        draft.formData.otherInfo?.previousPrograms,
      )
      mergeSection(formData.signature, draft.formData.signature)
    }

    if (
      Number.isInteger(draft.currentStepIndex) &&
      draft.currentStepIndex >= 0 &&
      draft.currentStepIndex < applicationSteps.length
    ) {
      currentStepIndex.value = draft.currentStepIndex
    }

    if (currentStepIndex.value === applicationSteps.length - 1) {
      ensureSignatureDefaults()
    }

    setNotice('success', '已从本地草稿恢复填写内容。')
  })

  return {
    addWorkExperience,
    addPreviousProgram,
    applicationSteps,
    clothingSizeOptions,
    currentStep,
    currentStepIndex,
    dismissNotice,
    errors,
    formData,
    genderOptions,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    industryOptions,
    idDocumentTypeOptions,
    listedCompanyOptions,
    notice,
    organizationTypeOptions,
    persistDraft,
    progressPercent,
    resetApplicationForm,
    removePreviousProgram,
    removeWorkExperience,
    removePhotoFile,
    setPhotoFile,
    validateFinalExport,
    visaOptions,
  }
}
