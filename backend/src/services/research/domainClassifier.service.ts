export interface DomainClassification {
  domain: string;
  keywords: string[];
  decomposedQuestions: string[];
}

export class DomainClassifierService {
  classify(query: string): DomainClassification {
    const qStr = typeof query === 'string' ? query : String(query || '');
    const clean = qStr.toLowerCase().trim();

    if (clean.includes('career') || clean.includes('guidance') || clean.includes('counseling') || clean.includes('education') || clean.includes('student')) {
      return {
        domain: 'Interdisciplinary General Science & Educational Technology',
        keywords: ['Career Guidance', 'Decision Support System', 'Vocational Counseling', 'Machine Learning Recommendation'],
        decomposedQuestions: [
          `What machine learning architectures are used in automated ${query}?`,
          `How do personalized decision support systems improve career guidance alignment?`,
          `What benchmark metrics evaluate career guidance recommendation models?`
        ]
      };
    }

    // Critical Care & Intensive Care Medicine (Sepsis, ICU, Dynamic Treatment Regimes, Emergency Care)
    if (
      clean.includes('sepsis') ||
      clean.includes('icu') ||
      clean.includes('intensive care') ||
      clean.includes('critical care') ||
      clean.includes('treatment regime') ||
      clean.includes('vasopressor') ||
      clean.includes('mimic')
    ) {
      return {
        domain: 'Critical Care Medicine & Intensive Care Informatics (ICU AI)',
        keywords: [
          'Sepsis Management',
          'Safe Offline Deep Reinforcement Learning',
          'Dynamic Treatment Regimes (DTR)',
          'Multimodal ICU Telemetry (MIMIC-IV)',
          'Vasopressor & Fluid Dosing Optimization',
          'Off-Policy Policy Evaluation'
        ],
        decomposedQuestions: [
          `What safe offline reinforcement learning algorithms prevent policy distribution shift in sepsis management?`,
          `How are multimodal physiological time-series from ICU databases (MIMIC-IV) modeled for dynamic treatment regimes?`,
          `What clinical safety constraints and off-policy evaluation metrics evaluate RL-guided vasopressor and fluid dosing?`
        ]
      };
    }

    // Clinical & Biomedical Healthcare AI (e.g. Kidney, Cancer, Patient, Clinical Decision Support)
    if (
      clean.includes('kidney') ||
      clean.includes('renal') ||
      clean.includes('clinical') ||
      clean.includes('patient') ||
      clean.includes('hospital') ||
      clean.includes('medical') ||
      clean.includes('healthcare') ||
      clean.includes('ehr') ||
      clean.includes('ckd') ||
      clean.includes('chronic disease')
    ) {
      return {
        domain: 'Clinical Decision Support & Biomedical Health Informatics',
        keywords: [
          'Chronic Kidney Disease (CKD)',
          'Federated Learning',
          'Clinical Decision Support',
          'Privacy-Preserving Machine Learning',
          'Safe Reinforcement Learning',
          'Disease Progression Prediction'
        ],
        decomposedQuestions: [
          `What federated learning protocols preserve patient privacy in chronic kidney disease progression modeling?`,
          `How does safe deep reinforcement learning optimize clinical treatment decision paths in CKD?`,
          `What fairness and bias mitigation metrics evaluate hybrid ML-DL models on longitudinal clinical EHR datasets?`
        ]
      };
    }

    if (
      clean.includes('leaf') ||
      clean.includes('crop') ||
      clean.includes('plant') ||
      clean.includes('tomato') ||
      clean.includes('agriculture') ||
      (clean.includes('disease') && (clean.includes('leaf') || clean.includes('crop') || clean.includes('plant') || clean.includes('foliar')))
    ) {
      return {
        domain: 'Bioinformatics & Agricultural Computer Vision',
        keywords: ['Crop Disease Detection', 'Vision Transformers', 'Plant Pathology', 'Leaf Diagnosis', 'Agricultural AI'],
        decomposedQuestions: [
          `What computer vision models achieve highest precision in ${query}?`,
          `How do vision transformers compare with CNNs for crop leaf disease detection?`,
          `What datasets benchmark automated plant pathology diagnosis?`
        ]
      };
    }

    if (clean.includes('quantum') || clean.includes('physics') || clean.includes('photonic') || clean.includes('circuit')) {
      return {
        domain: 'Quantum Computing & AI Physics',
        keywords: ['Quantum Machine Learning', 'Variational Quantum Circuits', 'Photonic Computing', 'Physics-Informed Neural Networks'],
        decomposedQuestions: [
          `What quantum algorithms accelerate ${query}?`,
          `How do hybrid classical-quantum models perform on financial optimization tasks?`,
          `What hardware constraints impact near-term quantum machine learning?`
        ]
      };
    }

    if (clean.includes('agent') || clean.includes('autonomous') || clean.includes('react') || clean.includes('reflexion') || clean.includes('gpt')) {
      return {
        domain: 'Artificial Intelligence & Agentic Workflows',
        keywords: ['Autonomous Agents', 'LLM Factuality', 'Tool Use', 'Multi-Agent Collaboration', 'Query Decomposition'],
        decomposedQuestions: [
          `What core bottlenecks limit autonomous AI agents in ${query}?`,
          `How does citation grounding mitigate LLM claim hallucinations?`,
          `What benchmarks evaluate multi-agent planning and tool execution?`
        ]
      };
    }

    if (clean.includes('bio') || clean.includes('dna') || clean.includes('protein') || clean.includes('genom') || clean.includes('gene')) {
      return {
        domain: 'Bioinformatics & Computational Biology',
        keywords: ['Genomic Transformers', 'Protein Folding', 'AlphaFold', 'Biological Sequence Alignment', 'BioAI'],
        decomposedQuestions: [
          `How do transformer architectures improve ${query}?`,
          `What datasets evaluate deep learning models in computational biology?`,
          `What limitations exist in predicting 3D protein structures?`
        ]
      };
    }

    if (clean.includes('security') || clean.includes('vulnerability') || clean.includes('cyber') || clean.includes('malware') || clean.includes('threat')) {
      return {
        domain: 'Cybersecurity & Threat Intelligence',
        keywords: ['Vulnerability Detection', 'Threat Graph Mining', 'Binary Analysis', 'Exploit Synthesis', 'CyberAI'],
        decomposedQuestions: [
          `How do large language models automate ${query}?`,
          `What graph neural network techniques detect binary vulnerabilities?`,
          `What benchmark metrics evaluate threat intelligence classification?`
        ]
      };
    }

    if (clean.includes('finance') || clean.includes('portfolio') || clean.includes('stock') || clean.includes('trading') || clean.includes('market')) {
      return {
        domain: 'Financial Econometrics & Quantitative AI',
        keywords: ['Financial Econometrics', 'Portfolio Optimization', 'High-Frequency Time Series', 'Market Sentiment Analysis'],
        decomposedQuestions: [
          `What deep learning architectures improve ${query}?`,
          `How does sentiment analysis impact algorithmic trading models?`,
          `What risk constraints govern automated quantitative portfolio selection?`
        ]
      };
    }

    // Default Interdisciplinary Classification
    const topicWords = query
      .split(' ')
      .filter(w => !['what', 'are', 'the', 'latest', 'approaches', 'for', 'with', 'using', 'how', 'can', 'and', 'in', 'of', 'on', 'a', 'an', 'to'].includes(w.toLowerCase()))
      .map(w => w.charAt(0).toUpperCase() + w.slice(1));

    const mainKeyword = topicWords.slice(0, 3).join(' ') || query;

    return {
      domain: `${mainKeyword} Research Domain`,
      keywords: [mainKeyword, 'Machine Learning', 'Decision Support', 'Empirical Evaluation'],
      decomposedQuestions: [
        `What are foundational models and methodologies in ${query}?`,
        `How do recent deep learning techniques improve benchmark metrics in ${query}?`,
        `What unaddressed research gaps exist in current literature for ${query}?`
      ]
    };
  }
}

export const domainClassifierService = new DomainClassifierService();
