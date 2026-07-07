<script setup>
import { computed } from 'vue'

const props = defineProps({
  formData: {
    type: Object,
    required: true,
  },
  industryOptions: {
    type: Array,
    default: () => [],
  },
})

const fallback = '未填写'

const formatValue = (value) => {
  if (Array.isArray(value)) {
    return value.length ? value.join('，') : fallback
  }

  if (typeof value === 'boolean') {
    return value ? '已确认' : '未确认'
  }

  if (value === null || value === undefined) {
    return fallback
  }

  const normalized = String(value).trim()
  return normalized || fallback
}

const formatChoice = (value) => {
  if (value === 'yes') return '是'
  if (value === 'no') return '否'
  if (value === 'male') return '男'
  if (value === 'female') return '女'
  return formatValue(value)
}

const selectedIndustry = computed(() =>
  props.industryOptions.find((item) => item.value === props.formData.industryInfo.industryNumber),
)

const basicInfoItems = computed(() => [
  ['中文姓名', props.formData.personalInfo.cnName],
  ['英文姓名', props.formData.personalInfo.enName],
  ['性别', formatChoice(props.formData.personalInfo.gender)],
  ['出生日期', props.formData.personalInfo.dateOfBirth],
  ['国籍', props.formData.personalInfo.nationality],
  ['出生地点', props.formData.personalInfo.countryOfBirth],
  ['证件类型', props.formData.personalInfo.idDocumentType],
  ['其他证件说明', props.formData.personalInfo.idDocumentOther],
  ['证件号码', props.formData.personalInfo.idNumber],
  ['是否持有有效美国签证', formatChoice(props.formData.personalInfo.hasUsVisa)],
  ['签证到期时间', props.formData.personalInfo.visaExpirationDate],
  ['办公电话', props.formData.personalInfo.workPhone],
  ['手机号码', props.formData.personalInfo.mobilePhone],
  ['电子邮箱', props.formData.personalInfo.email],
  ['通讯地址', props.formData.personalInfo.address],
  ['衣服尺码', props.formData.personalInfo.clothingSize],
  ['LinkedIn 账号', props.formData.personalInfo.linkedin],
  ['证件照文件名', props.formData.personalInfo.idPhotoFileName],
])

const contactItems = computed(() => [
  ['中文姓名', props.formData.contactPerson.cnName],
  ['英文姓名', props.formData.contactPerson.enName],
  ['性别', formatChoice(props.formData.contactPerson.gender)],
  ['与申请人关系', props.formData.contactPerson.relationship],
  ['手机号码', props.formData.contactPerson.mobilePhone],
  ['电子邮箱', props.formData.contactPerson.email],
])

const professionalItems = computed(() => [
  ['全职工作时间', props.formData.professionalInfo.totalWorkYears],
  ['担任管理工作时间', props.formData.professionalInfo.managementYears],
  ['在目前机构担任工作年限', props.formData.professionalInfo.currentOrganizationYears],
  ['职务', props.formData.professionalInfo.position],
  ['雇员人数', props.formData.professionalInfo.employeeCount],
  ['现任单位名称中文', props.formData.professionalInfo.organizationNameCn],
  ['现任单位名称英文', props.formData.professionalInfo.organizationNameEn],
  ['现任单位网址', props.formData.professionalInfo.website],
  ['企业性质', props.formData.professionalInfo.organizationType],
  ['企业性质其他说明', props.formData.professionalInfo.organizationTypeOther],
  ['公司资产', props.formData.professionalInfo.totalAssets],
  ['公司上年销售额', props.formData.professionalInfo.annualRevenue],
  ['公司上年度利润额', props.formData.professionalInfo.annualProfit],
  ['资产管理规模', props.formData.professionalInfo.assetsUnderManagement],
  ['其他年度业务量指标', props.formData.professionalInfo.otherBusinessVolumeIndicator],
  ['是否为上市公司', formatChoice(props.formData.professionalInfo.isListedCompany)],
  ['证券交易所', props.formData.professionalInfo.listedStockExchange],
  ['股票代码', props.formData.professionalInfo.tickerSymbol],
])

const otherInfoItems = computed(() => [
  ['申请动机', props.formData.otherInfo.applicationMotivation],
  ['发展目标', props.formData.otherInfo.developmentGoals],
  ['主要成就和社会荣誉', props.formData.otherInfo.achievements],
  ['是否同时申请其他院校课程', formatChoice(props.formData.otherInfo.applyingOtherPrograms)],
  ['其他院校课程说明', props.formData.otherInfo.applyingOtherProgramsDetail],
  [
    '是否参加过其他商学院培训课程',
    formatChoice(props.formData.otherInfo.participatedBusinessSchoolPrograms),
  ],
  [
    '参加过的商学院课程说明',
    props.formData.otherInfo.participatedBusinessSchoolProgramsDetail,
  ],
  ['兴趣爱好', props.formData.otherInfo.personalInterests],
  ['是否愿意担任班委', formatChoice(props.formData.otherInfo.interestedInClassLeadership)],
  ['是否愿意接待参访活动', formatChoice(props.formData.otherInfo.willingToHostActivities)],
])

const signatureItems = computed(() => [
  ['保密说明', props.formData.signature.confidentialityConfirmed ? '已确认' : '未确认'],
  ['申请人声明', props.formData.signature.declarationConfirmed ? '已确认' : '未确认'],
  ['最终确认', props.formData.signature.finalConfirmed ? '已确认' : '未确认'],
  ['申请人签名', props.formData.signature.applicantSignature],
  ['申请日期', props.formData.signature.applicationDate],
])
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
        <div v-for="[label, value] in basicInfoItems" :key="label">
          <strong>{{ label }}</strong>
          <span>{{ formatValue(value) }}</span>
        </div>
      </div>
      <div class="gvip-demo-pdf-block">
        <strong>指定联系人信息</strong>
        <div class="gvip-demo-pdf-grid">
          <div v-for="[label, value] in contactItems" :key="`contact-${label}`">
            <strong>{{ label }}</strong>
            <span>{{ formatValue(value) }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="gvip-demo-pdf-section">
      <div class="gvip-demo-pdf-section__heading">
        <h2>工作背景</h2>
        <span>Professional Information</span>
      </div>
      <div class="gvip-demo-pdf-grid">
        <div v-for="[label, value] in professionalItems" :key="label">
          <strong>{{ label }}</strong>
          <span>{{ formatValue(value) }}</span>
        </div>
        <div>
          <strong>行业类别</strong>
          <span>
            {{
              selectedIndustry
                ? `${selectedIndustry.value} ${selectedIndustry.cnLabel} / ${selectedIndustry.enLabel}`
                : formatValue(formData.industryInfo.industryOther)
            }}
          </span>
        </div>
        <div>
          <strong>行业其他说明</strong>
          <span>{{ formatValue(formData.industryInfo.industryOther) }}</span>
        </div>
      </div>

      <div class="gvip-demo-pdf-block">
        <strong>工作履历</strong>
        <div class="gvip-demo-pdf-table">
          <div class="gvip-demo-pdf-table__head">
            <span>时间</span>
            <span>机构</span>
            <span>职位</span>
          </div>
          <div
            v-for="(item, index) in formData.workExperiences"
            :key="`work-${index}`"
            class="gvip-demo-pdf-table__row"
          >
            <span>{{ formatValue(item.dateRange) }}</span>
            <span>{{ formatValue(item.organization) }}</span>
            <span>{{ formatValue(item.position) }}</span>
          </div>
        </div>
      </div>

      <div class="gvip-demo-pdf-block">
        <strong>企业简介</strong>
        <p class="gvip-demo-pdf-paragraph">{{ formatValue(formData.organizationIntroduction) }}</p>
      </div>
    </section>

    <section class="gvip-demo-pdf-section">
      <div class="gvip-demo-pdf-section__heading">
        <h2>其他信息</h2>
        <span>Other Information</span>
      </div>
      <div class="gvip-demo-pdf-grid">
        <div v-for="[label, value] in otherInfoItems" :key="label">
          <strong>{{ label }}</strong>
          <span>{{ formatValue(value) }}</span>
        </div>
      </div>

      <div class="gvip-demo-pdf-block">
        <strong>过往课程经历</strong>
        <div class="gvip-demo-pdf-table">
          <div class="gvip-demo-pdf-table__head gvip-demo-pdf-table__head--two">
            <span>项目名称</span>
            <span>院校</span>
          </div>
          <div
            v-for="(item, index) in formData.otherInfo.previousPrograms"
            :key="`program-${index}`"
            class="gvip-demo-pdf-table__row gvip-demo-pdf-table__row--two"
          >
            <span>{{ formatValue(item.programTitle) }}</span>
            <span>{{ formatValue(item.institution) }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="gvip-demo-pdf-section">
      <div class="gvip-demo-pdf-section__heading">
        <h2>签名确认</h2>
        <span>Signature Page</span>
      </div>
      <div class="gvip-demo-pdf-grid">
        <div v-for="[label, value] in signatureItems" :key="label">
          <strong>{{ label }}</strong>
          <span>{{ formatValue(value) }}</span>
        </div>
      </div>
    </section>
  </article>
</template>
