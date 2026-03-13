// Catalogo de modelos 3D de coracao do NIH 3D Heart Library
// Fonte: https://3d.nih.gov/collections/heart-library

export interface HeartModel {
  id: string
  filename: string
  name: string
  description: string
  category: 'normal' | 'congenital' | 'valve' | 'vessel' | 'myocardium' | 'bloodpool' | 'other'
  condition?: string
  size: number // bytes
  recommended?: boolean
}

export const heartModels: HeartModel[] = [
  // === MODELOS RECOMENDADOS (Coracao completo) ===
  {
    id: 'cm0036-whole',
    filename: 'CM0036_Whole_NIH3D.glb',
    name: 'Coracao Completo #36',
    description: 'Modelo completo do coracao com todas as estruturas - ideal para visualizacao geral',
    category: 'normal',
    size: 29447200,
    recommended: true
  },
  {
    id: 'cm0028-whole',
    filename: 'CM0028_Whole_1_NIH3D.glb',
    name: 'Coracao Completo #28',
    description: 'Modelo anatomico completo de alta resolucao',
    category: 'normal',
    size: 13764420,
    recommended: true
  },
  {
    id: 'cm0024-whole',
    filename: 'CM0024_Whole_1_NIH3D.glb',
    name: 'Coracao Completo #24',
    description: 'Coracao completo com detalhes anatomicos',
    category: 'normal',
    size: 7294448,
    recommended: true
  },
  {
    id: 'cm0022-whole',
    filename: 'CM0022_Whole_1_NIH3D.glb',
    name: 'Coracao Completo #22',
    description: 'Modelo anatomico padrao',
    category: 'normal',
    size: 6734924
  },
  {
    id: 'cm0037-whole',
    filename: 'CM0037_Whole_NIH3D.glb',
    name: 'Coracao Completo #37',
    description: 'Modelo compacto, carregamento rapido',
    category: 'normal',
    size: 2522624,
    recommended: true
  },
  {
    id: 'heart-fbx',
    filename: 'Heart.fbx',
    name: 'Coracao Anatomico (FBX)',
    description: 'Modelo detalhado em formato FBX',
    category: 'normal',
    size: 16017612
  },

  // === MODELOS COM CORONARIAS ===
  {
    id: 'cm0115-coronaries',
    filename: 'CM01152C2C%20coronaries_NIH3D.glb',
    name: 'Coronarias Detalhadas #115',
    description: 'Modelo com arterias coronarias em alta resolucao - ideal para visualizar estenoses',
    category: 'vessel',
    condition: 'Coronariopatia',
    size: 57002416,
    recommended: true
  },
  {
    id: 'cm0119-coronaries',
    filename: 'CM01192C%20coronaries_NIH3D.glb',
    name: 'Coronarias #119',
    description: 'Sistema coronariano completo',
    category: 'vessel',
    condition: 'Coronariopatia',
    size: 18774632
  },

  // === MODELOS COM TROMBO ===
  {
    id: 'cm0121-thrombus',
    filename: 'CM01212C%20thrombus_NIH3D.glb',
    name: 'Coracao com Trombo #121',
    description: 'Modelo mostrando formacao de trombo - ideal para demonstrar trombose',
    category: 'other',
    condition: 'Trombose',
    size: 7378144,
    recommended: true
  },

  // === MIOCARDIO (Musculo cardiaco) ===
  {
    id: 'myo-main',
    filename: 'Myo_NIH3D.glb',
    name: 'Miocardio Principal',
    description: 'Modelo do musculo cardiaco isolado',
    category: 'myocardium',
    size: 15263200
  },
  {
    id: 'cm0116-myo',
    filename: 'CM0116_myo_NIH3D.glb',
    name: 'Miocardio #116',
    description: 'Musculo cardiaco detalhado',
    category: 'myocardium',
    size: 10848200
  },
  {
    id: 'cm0131-myo',
    filename: 'CM0131%20Myo_NIH3D.glb',
    name: 'Miocardio #131 - VSD',
    description: 'Defeito do septo ventricular (VSD)',
    category: 'congenital',
    condition: 'VSD - Defeito Septal Ventricular',
    size: 15555392
  },
  {
    id: 'cm0138-myo',
    filename: 'CM0138%20myo_NIH3D.glb',
    name: 'Miocardio #138 - VSD Complexo',
    description: 'VSD complexo',
    category: 'congenital',
    condition: 'VSD Complexo',
    size: 8190760
  },
  {
    id: 'cm0141-myo',
    filename: 'CM0141%20Myo_NIH3D.glb',
    name: 'Miocardio #141',
    description: 'Arco aortico interrompido com VSD',
    category: 'congenital',
    condition: 'Arco Aortico Interrompido',
    size: 6057092
  },
  {
    id: 'cm0151-myo',
    filename: 'CM0151%20Myo_NIH3D.glb',
    name: 'Miocardio #151 - LTGA',
    description: 'Transposicao das grandes arterias (L-TGA)',
    category: 'congenital',
    condition: 'L-TGA',
    size: 5388472
  },

  // === BLOOD POOL (Fluxo sanguineo) ===
  {
    id: 'bp-main',
    filename: 'bp_NIH3D.glb',
    name: 'Blood Pool Principal',
    description: 'Visualizacao do fluxo sanguineo nas camaras',
    category: 'bloodpool',
    size: 2876104
  },
  {
    id: 'cm0016-bp',
    filename: 'CM0016_BP_NIH3D.glb',
    name: 'Blood Pool #16',
    description: 'Fluxo sanguineo - modelo compacto',
    category: 'bloodpool',
    size: 709468
  },
  {
    id: 'cm0017-bp',
    filename: 'CM0017_BP_NIH3D.glb',
    name: 'Blood Pool #17',
    description: 'Fluxo nas camaras cardiacas',
    category: 'bloodpool',
    size: 945688
  },
  {
    id: 'cm0024-bp',
    filename: 'CM0024_BP_1_NIH3D.glb',
    name: 'Blood Pool #24',
    description: 'Fluxo sanguineo detalhado',
    category: 'bloodpool',
    size: 3652568
  },
  {
    id: 'cm0042-bp',
    filename: 'CM0042_BP_NIH3D.glb',
    name: 'Blood Pool #42',
    description: 'Modelo de fluxo em alta resolucao',
    category: 'bloodpool',
    size: 8123700
  },
  {
    id: 'cm0099-bp',
    filename: 'CM0099%20Bloodpool_001_NIH3D.glb',
    name: 'Blood Pool #99 - Anel Vascular',
    description: 'Anomalia do anel vascular',
    category: 'congenital',
    condition: 'Anel Vascular',
    size: 9567332
  },
  {
    id: 'cm0108-bp',
    filename: 'CM0108_BP_NIH3D.glb',
    name: 'Blood Pool #108',
    description: 'Arco aortico direito com ALSCA',
    category: 'congenital',
    condition: 'Arco Aortico Direito',
    size: 3438572
  },

  // === VASOS ESPECIFICOS ===
  {
    id: 'cm0054-pulmonary',
    filename: 'CM0054_MB_bp_vessel_pulmonary_NIH3D.glb',
    name: 'Vasos Pulmonares #54',
    description: 'Sistema vascular pulmonar isolado',
    category: 'vessel',
    size: 1236556
  },
  {
    id: 'cm0054-systemic',
    filename: 'CM0054_MB_bp_vessel_systemic_NIH3D.glb',
    name: 'Vasos Sistemicos #54',
    description: 'Sistema vascular sistemico isolado',
    category: 'vessel',
    size: 2110564
  },

  // === MODELOS ESPECIAIS ===
  {
    id: 'cm0042-hollow',
    filename: 'CM0042_hollow_NIH3D.glb',
    name: 'Coracao Oco #42',
    description: 'Modelo oco para visualizar interior das camaras',
    category: 'other',
    size: 27766428
  },
  {
    id: 'cm0019',
    filename: 'CM0019_1_NIH3D.glb',
    name: 'Caso #19',
    description: 'Modelo anatomico caso clinico',
    category: 'other',
    size: 9723308
  },
  {
    id: 'cm0035',
    filename: 'CM0035_NIH3D.glb',
    name: 'Caso #35',
    description: 'Modelo anatomico caso clinico',
    category: 'other',
    size: 7549464
  },
  {
    id: 'cm0036-a',
    filename: 'CM0036_A_NIH3D.glb',
    name: 'Caso #36 - Parte A',
    description: 'Secao A do modelo',
    category: 'other',
    size: 8628008
  },
  {
    id: 'cm0036-b',
    filename: 'CM0036_B_NIH3D.glb',
    name: 'Caso #36 - Parte B',
    description: 'Secao B do modelo',
    category: 'other',
    size: 6594372
  },
  {
    id: 'cm0036-c',
    filename: 'CM0036_C_NIH3D.glb',
    name: 'Caso #36 - Parte C',
    description: 'Secao C do modelo',
    category: 'other',
    size: 15650044
  },
  {
    id: 'cm0058',
    filename: 'CM0058_MB_NIH3D.glb',
    name: 'Caso #58',
    description: 'Modelo anatomico',
    category: 'other',
    size: 2096800
  },
  {
    id: 'cm0024-a',
    filename: 'CM0024_A_1_NIH3D.glb',
    name: 'Caso #24 - Parte A',
    description: 'Secao anatomica',
    category: 'other',
    size: 2973616
  },
]

// Modelos recomendados por categoria de uso
export const recommendedModels = {
  general: 'cm0037-whole', // Coracao completo, carregamento rapido
  detailed: 'cm0036-whole', // Mais detalhado
  coronary: 'cm0115-coronaries', // Para visualizar arterias coronarias
  thrombus: 'cm0121-thrombus', // Para demonstrar trombose
  congenital: 'cm0131-myo', // Doencas congenitas
}

// Funcao para obter modelo por ID
export function getModelById(id: string): HeartModel | undefined {
  return heartModels.find(m => m.id === id)
}

// Funcao para obter modelos por categoria
export function getModelsByCategory(category: HeartModel['category']): HeartModel[] {
  return heartModels.filter(m => m.category === category)
}

// Funcao para obter modelos recomendados
export function getRecommendedModels(): HeartModel[] {
  return heartModels.filter(m => m.recommended)
}

// Funcao para formatar tamanho
export function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
