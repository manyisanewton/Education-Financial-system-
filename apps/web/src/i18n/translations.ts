import type { Language } from '../types'

export const translations = {
  en: {
    dashboard:'Dashboard', students:'Students', fees:'Fee structures', payments:'Payments', expenses:'Expenses', budgets:'Budgets', reports:'Reports', audit:'Audit log', team:'Team & roles', settings:'Settings',
    overview:'Financial overview', overviewSub:'Here is how Greenfield Academy is doing this term.', expected:'Fees expected', collected:'Fees collected', outstanding:'Outstanding', expensesTotal:'Total expenses', collectionRate:'Collection rate',
    recordPayment:'Record payment', addStudent:'Add student', viewReports:'View reports', collections:'Collections & expenses', term:'Term 2, 2026', recentPayments:'Recent payments', viewAll:'View all', classPerformance:'Collection by class', quickActions:'Quick actions',
    search:'Search students, payments, receipts...', notifications:'Notifications', help:'Help centre', school:'Greenfield Academy', role:'School accountant', studentsTitle:'Student accounts', studentsSub:'Track fee balances and account activity for every learner.',
    allStudents:'All students', student:'Student', grade:'Class', guardian:'Guardian', billed:'Billed', paid:'Paid', balance:'Balance', status:'Status', actions:'Actions', export:'Export', filter:'Filter',
    comingSoon:'This module is ready for the next build phase.', mockNotice:'Demo workspace • Mock data', welcome:'Good morning, Catherine', academic:'2026 Academic Year'
  },
  sw: {
    dashboard:'Dashibodi', students:'Wanafunzi', fees:'Miundo ya ada', payments:'Malipo', expenses:'Matumizi', budgets:'Bajeti', reports:'Ripoti', audit:'Rekodi ya ukaguzi', team:'Timu na majukumu', settings:'Mipangilio',
    overview:'Muhtasari wa fedha', overviewSub:'Hivi ndivyo Greenfield Academy inavyofanya muhula huu.', expected:'Ada inayotarajiwa', collected:'Ada iliyokusanywa', outstanding:'Ada inayodaiwa', expensesTotal:'Jumla ya matumizi', collectionRate:'Kiwango cha ukusanyaji',
    recordPayment:'Rekodi malipo', addStudent:'Ongeza mwanafunzi', viewReports:'Tazama ripoti', collections:'Makusanyo na matumizi', term:'Muhula wa 2, 2026', recentPayments:'Malipo ya hivi karibuni', viewAll:'Tazama yote', classPerformance:'Makusanyo kwa darasa', quickActions:'Vitendo vya haraka',
    search:'Tafuta wanafunzi, malipo, risiti...', notifications:'Arifa', help:'Kituo cha msaada', school:'Greenfield Academy', role:'Mhasibu wa shule', studentsTitle:'Akaunti za wanafunzi', studentsSub:'Fuatilia salio la ada na shughuli za akaunti za wanafunzi.',
    allStudents:'Wanafunzi wote', student:'Mwanafunzi', grade:'Darasa', guardian:'Mlezi', billed:'Ada', paid:'Imelipwa', balance:'Salio', status:'Hali', actions:'Vitendo', export:'Pakua', filter:'Chuja',
    comingSoon:'Sehemu hii iko tayari kwa awamu inayofuata.', mockNotice:'Eneo la majaribio • Data ya mfano', welcome:'Habari za asubuhi, Catherine', academic:'Mwaka wa Masomo 2026'
  }
} as const

export type TranslationKey = keyof typeof translations.en

export const translate = (language: Language, key: TranslationKey) => translations[language][key]
