export const applicationSteps = [
  {
    key: 'basic',
    title: '基本信息',
    subtitle: 'PERSONAL INFORMATION',
    description: '请填写真实、完整的个人信息，我们将严格保密您的资料。',
  },
  {
    key: 'professional',
    title: '工作背景',
    subtitle: 'PROFESSIONAL INFORMATION',
    description: '请填写您的工作经历、企业信息、行业类别与组织背景。',
  },
  {
    key: 'other',
    title: '其他信息',
    subtitle: 'OTHER INFORMATION',
    description: '请补充申请动机、发展目标、过往课程与个人兴趣等信息。',
  },
  {
    key: 'signature',
    title: '签名确认',
    subtitle: 'SIGNATURE PAGE',
    navSubtitle: 'SIGNATURE PAGE',
    description: '请在最终阶段确认信息并完成签名。',
  },
]

export const genderOptions = [
  { label: '男 Male', value: 'male' },
  { label: '女 Female', value: 'female' },
]

export const visaOptions = [
  { label: '是 Yes', value: 'yes' },
  { label: '否 No', value: 'no' },
]

export const clothingSizeOptions = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']

export const idDocumentTypeOptions = [
  { label: '身份证 National ID', value: 'national-id' },
  { label: '护照 Passport', value: 'passport' },
  {
    label: '港澳台居民来往大陆通行证 Mainland Travel Permit',
    value: 'travel-permit',
  },
  { label: '其他 Other', value: 'other' },
]

export const organizationTypeOptions = [
  { label: '国营 State-owned', value: 'state-owned' },
  { label: '民营 Private', value: 'private' },
  { label: '中外合资 Joint Venture', value: 'joint-venture' },
  { label: '外商独资 Wholly Foreign-owned', value: 'wholly-foreign-owned' },
  { label: '其他 Other', value: 'other' },
]

export const listedCompanyOptions = [
  { label: '是 Yes', value: 'yes' },
  { label: '否 No', value: 'no' },
]

export function createInitialWorkExperience() {
  return {
    dateRange: '',
    organization: '',
    position: '',
  }
}

export function createInitialPreviousProgram() {
  return {
    programTitle: '',
    institution: '',
  }
}

export function createInitialFormData() {
  return {
    personalInfo: {
      cnName: '',
      enName: '',
      gender: '',
      dateOfBirth: '',
      nationality: '',
      countryOfBirth: '',
      idDocumentType: '',
      idDocumentOther: '',
      idNumber: '',
      hasUsVisa: '',
      visaExpirationDate: '',
      workPhone: '',
      mobilePhone: '',
      email: '',
      address: '',
      clothingSize: '',
      linkedin: '',
      idPhotoFileName: '',
    },
    contactPerson: {
      cnName: '',
      enName: '',
      gender: '',
      relationship: '',
      mobilePhone: '',
      email: '',
    },
    professionalInfo: {
      totalWorkYears: '',
      managementYears: '',
      currentOrganizationYears: '',
      position: '',
      employeeCount: '',
      organizationNameCn: '',
      organizationNameEn: '',
      website: '',
      organizationType: '',
      organizationTypeOther: '',
      totalAssets: '',
      annualRevenue: '',
      annualProfit: '',
      assetsUnderManagement: '',
      otherBusinessVolumeIndicator: '',
      isListedCompany: '',
      listedStockExchange: '',
      tickerSymbol: '',
    },
    industryInfo: {
      industryNumber: '',
      industryOther: '',
    },
    workExperiences: [createInitialWorkExperience()],
    organizationIntroduction: '',
    otherInfo: {
      applicationMotivation: '',
      developmentGoals: '',
      achievements: '',
      applyingOtherPrograms: '',
      applyingOtherProgramsDetail: '',
      participatedBusinessSchoolPrograms: '',
      participatedBusinessSchoolProgramsDetail: '',
      previousPrograms: [
        createInitialPreviousProgram(),
        createInitialPreviousProgram(),
      ],
      personalInterests: '',
      interestedInClassLeadership: '',
      willingToHostActivities: '',
    },
    signature: {
      confidentialityConfirmed: false,
      declarationConfirmed: false,
      applicantSignature: '',
      applicationDate: '',
      finalConfirmed: false,
    },
  }
}

export const applicationSchema = {
  version: 'application-form-v2',
  steps: applicationSteps,
}
