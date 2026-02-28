import OpenAI from 'openai';

const EMERGENCY_KEYWORDS = [
  'chest pain',
  'difficulty breathing',
  'shortness of breath',
  'severe bleeding',
  'stroke',
  'unconscious',
  'seizure'
];

const hasEmergencySignal = (symptoms = []) => {
  const joined = symptoms.join(' ').toLowerCase();
  return EMERGENCY_KEYWORDS.some((keyword) => joined.includes(keyword));
};

const sanitizeSymptom = (value = '') => `${value}`.replace(/[<>$`]/g, '').trim();

const inferSpecializations = (symptoms = []) => {
  const text = symptoms.join(' ').toLowerCase();
  const result = new Set();

  if (/(cough|fever|breathing|asthma|cold|chest)/.test(text)) result.add('Pulmonology');
  if (/(skin|rash|itch|allergy)/.test(text)) result.add('Dermatology');
  if (/(headache|seizure|dizziness|migraine)/.test(text)) result.add('Neurology');
  if (/(stomach|vomit|diarrhea|acidity|liver)/.test(text)) result.add('Gastroenterology');
  if (/(joint|bone|back pain|fracture)/.test(text)) result.add('Orthopedics');
  if (/(sugar|diabetes|hba1c|thyroid)/.test(text)) result.add('Endocrinology');
  if (result.size === 0) result.add('General Medicine');

  return [...result];
};

const heuristicAnalysis = (symptoms = []) => {
  const normalized = symptoms.map((s) => s.toLowerCase().trim()).filter(Boolean);
  const symptomText = normalized.join(' ');

  let likelyConditions = ['General viral infection'];
  let precautions = ['Stay hydrated', 'Get enough rest', 'Monitor symptoms for 24-48 hours'];
  let riskLevel = 'low';

  if (hasEmergencySignal(normalized)) {
    likelyConditions = ['Potential emergency condition'];
    precautions = ['Seek emergency medical care immediately'];
    riskLevel = 'high';
  } else if (symptomText.includes('fever') && symptomText.includes('cough')) {
    likelyConditions = ['Upper respiratory tract infection', 'Flu-like illness'];
    precautions = ['Drink warm fluids', 'Use mask in shared spaces', 'Consult a doctor if fever persists more than 2 days'];
    riskLevel = 'medium';
  } else if (symptomText.includes('headache') && symptomText.includes('nausea')) {
    likelyConditions = ['Migraine', 'Dehydration-related headache'];
    precautions = ['Hydrate well', 'Reduce screen exposure', 'Consult doctor if severe or recurrent'];
    riskLevel = 'medium';
  } else if (symptomText.includes('stomach pain') || symptomText.includes('diarrhea')) {
    likelyConditions = ['Gastroenteritis', 'Food intolerance'];
    precautions = ['Use oral rehydration solution', 'Eat bland food', 'See doctor if blood in stool or persistent vomiting'];
    riskLevel = 'medium';
  }

  return {
    followUpQuestions: [
      'How long have you had these symptoms?',
      'How severe are your symptoms on a scale of 1-10?',
      'Do you have associated symptoms like fever, vomiting, breathing issues, or chest pain?',
      'Any recent travel history or known infection exposure?',
      'Do you smoke, drink alcohol, or have chronic conditions?'
    ],
    likelyConditions,
    precautions,
    riskLevel,
    emergency: riskLevel === 'high',
    recommendedSpecializations: inferSpecializations(normalized),
    doctorVisitAdvice: riskLevel === 'high' ? 'Visit emergency care immediately.' : 'Consult a doctor if symptoms persist or worsen.',
    disclaimer: 'This is not a diagnosis. Please consult your doctor for proper diagnosis and treatment.'
  };
};

const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  return new OpenAI({
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL || undefined
  });
};

export const analyzeSymptoms = async (symptoms = []) => {
  const cleanedSymptoms = Array.isArray(symptoms)
    ? symptoms.map(sanitizeSymptom).filter(Boolean).slice(0, 25)
    : [];

  if (cleanedSymptoms.length === 0) {
    return {
      followUpQuestions: [],
      likelyConditions: [],
      precautions: [],
      recommendedSpecializations: [],
      riskLevel: 'low',
      emergency: false,
      doctorVisitAdvice: '',
      disclaimer: 'Provide at least one symptom to analyze.'
    };
  }

  const client = getOpenAIClient();
  if (!client) {
    return heuristicAnalysis(cleanedSymptoms);
  }

  try {
    const prompt = `Analyze symptoms and respond ONLY as JSON with keys:
followUpQuestions (array of strings),
likelyConditions (array of strings),
precautions (array of strings),
recommendedSpecializations (array of strings),
riskLevel (low|medium|high),
emergency (boolean),
doctorVisitAdvice (string).
Symptoms: ${cleanedSymptoms.join(', ')}`;

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content: 'You are a conservative healthcare triage assistant. You never provide definitive diagnosis.'
        },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    });

    const content = completion.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content || '{}');

    return {
      followUpQuestions: Array.isArray(parsed.followUpQuestions) ? parsed.followUpQuestions : [],
      likelyConditions: Array.isArray(parsed.likelyConditions) ? parsed.likelyConditions : [],
      precautions: Array.isArray(parsed.precautions) ? parsed.precautions : [],
      recommendedSpecializations: Array.isArray(parsed.recommendedSpecializations) && parsed.recommendedSpecializations.length > 0
        ? parsed.recommendedSpecializations
        : inferSpecializations(cleanedSymptoms),
      riskLevel: ['low', 'medium', 'high'].includes(parsed.riskLevel) ? parsed.riskLevel : 'low',
      emergency: Boolean(parsed.emergency),
      doctorVisitAdvice: parsed.doctorVisitAdvice || 'Consult a doctor if symptoms persist or worsen.',
      disclaimer: 'This is not a diagnosis. Please consult your doctor for proper diagnosis and treatment.'
    };
  } catch (error) {
    return heuristicAnalysis(cleanedSymptoms);
  }
};
