import { GoogleGenerativeAI } from '@google/generative-ai';
import AIConversation from '../models/AIConversation.js';
import AIMessage from '../models/AIMessage.js';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { analyzeSymptoms } from '../services/aiService.js';

const SYSTEM_PROMPT = `You are a professional AI Health Assistant for RuralCare Connect, a rural healthcare platform.

RULES:
1. You provide general health information, wellness tips, and help users understand symptoms.
2. You NEVER diagnose conditions or prescribe medications.
3. You ALWAYS recommend consulting a qualified doctor for serious symptoms.
4. You use empathetic, clear, and simple language suitable for rural communities.
5. If a user describes emergency symptoms (chest pain, difficulty breathing, severe bleeding, stroke signs), immediately tell them to call emergency services or visit the nearest hospital.
6. You can discuss general topics like nutrition, hygiene, preventive care, first aid, and common ailments.
7. Keep responses concise (under 300 words) and structured with bullet points when listing symptoms or advice.
8. End every response about symptoms with: "Please consult your doctor for proper diagnosis and treatment."

You are NOT a replacement for medical professionals. You are a health information assistant.`;

// Local fallback responses when API is unavailable
const FALLBACK_RESPONSES = {
    cold: `Here are some common cold remedies:\n\n• **Rest** — Get plenty of sleep to help your immune system fight the infection\n• **Stay hydrated** — Drink warm water, herbal teas, and clear broths\n• **Honey & ginger tea** — Natural soothing remedy for sore throat\n• **Steam inhalation** — Helps clear nasal congestion\n• **Saltwater gargle** — Relieves sore throat\n• **Vitamin C** — Citrus fruits, amla (Indian gooseberry)\n\nPlease consult your doctor for proper diagnosis and treatment.`,

    fever: `For managing fever:\n\n• **Rest** in a comfortable, cool environment\n• **Stay hydrated** — Drink plenty of fluids\n• **Cool compress** — Apply a damp cloth to the forehead\n• **Light clothing** — Don't over-bundle\n• **Paracetamol** — Over-the-counter fever reducer (follow dosage instructions)\n\n⚠️ **Seek immediate medical attention if:**\n- Fever exceeds 103°F (39.4°C)\n- Fever persists for more than 3 days\n- Accompanied by severe headache, stiff neck, or rash\n\nPlease consult your doctor for proper diagnosis and treatment.`,

    headache: `Tips for managing headaches:\n\n• **Hydrate** — Dehydration is a common cause\n• **Rest** in a quiet, dark room\n• **Cold or warm compress** on your forehead\n• **Gentle massage** of temples and neck\n• **OTC pain relievers** — Paracetamol or ibuprofen as directed\n• **Avoid screen time** temporarily\n\n⚠️ **Seek emergency care if:**\n- Sudden severe headache ("worst headache of your life")\n- Headache with fever, stiff neck, confusion, or vision changes\n\nPlease consult your doctor for proper diagnosis and treatment.`,

    diabetes: `Tips for managing diabetes:\n\n• **Monitor blood sugar** regularly\n• **Balanced diet** — Focus on whole grains, vegetables, lean proteins\n• **Limit sugar & refined carbs**\n• **Regular exercise** — 30 minutes daily walking helps\n• **Take medications** as prescribed by your doctor\n• **Stay hydrated** — Drink plenty of water\n• **Regular checkups** — Visit your doctor every 3-6 months\n\n**Foods that help:**\n- Bitter gourd (karela), fenugreek (methi)\n- Leafy green vegetables\n- Whole grains like oats, brown rice\n\nPlease consult your doctor for proper diagnosis and treatment.`,

    sleep: `Tips for better sleep:\n\n• **Consistent schedule** — Sleep and wake at the same time daily\n• **Limit screens** — No phones/TV 1 hour before bed\n• **Cool, dark room** — Optimal sleeping environment\n• **Avoid caffeine** after 2 PM\n• **Light dinner** — Eat at least 2 hours before bed\n• **Relaxation techniques** — Deep breathing, gentle stretching\n• **Warm milk** with turmeric (haldi doodh) before bed\n• **Regular exercise** — But not too close to bedtime\n\nPlease consult your doctor if sleep problems persist.`,

    burn: `First aid for burns:\n\n**Immediately:**\n1. **Cool the burn** — Run cool (not cold) water over it for 10-20 minutes\n2. **Remove jewelry/clothing** from the area (if not stuck)\n3. **Cover loosely** with a clean, sterile bandage\n\n**Do NOT:**\n- Apply ice directly\n- Use butter, toothpaste, or oil\n- Pop blisters\n\n⚠️ **Seek emergency care for:**\n- Burns larger than your palm\n- Burns on face, hands, feet, or joints\n- Deep burns (white or charred skin)\n- Electrical or chemical burns\n\nPlease consult your doctor for proper diagnosis and treatment.`,

    emergency: `🚨 **EMERGENCY — Call for help immediately!**\n\nIf you or someone is experiencing:\n- **Chest pain** or pressure\n- **Difficulty breathing**\n- **Severe bleeding**\n- **Signs of stroke** (face drooping, arm weakness, speech difficulty)\n- **Loss of consciousness**\n- **Severe allergic reaction**\n\n**Call emergency services immediately or go to the nearest hospital.**\n\n**While waiting for help:**\n- Stay calm\n- Don't move the person if they may have a spinal injury\n- Apply pressure to any bleeding wounds\n- If trained, perform CPR if the person is not breathing`,

    default: `Hello! I'm your AI Health Assistant for RuralCare Connect. 👋\n\nI can help you with general health information about:\n• **Common illnesses** — Cold, fever, headache\n• **Chronic conditions** — Diabetes management tips\n• **Wellness** — Sleep, nutrition, exercise\n• **First aid** — Burns, cuts, basic care\n• **Preventive care** — Hygiene, vaccination info\n\nPlease ask me a specific health question and I'll do my best to help!\n\n⚠️ *Remember: I provide general health information only. Always consult your doctor for medical advice and diagnosis.*`
};

function getLocalResponse(message) {
    const msg = message.toLowerCase();

    if (msg.includes('emergency') || msg.includes('chest pain') || msg.includes('breathing') || msg.includes('bleeding') || msg.includes('stroke') || msg.includes('unconscious'))
        return FALLBACK_RESPONSES.emergency;
    if (msg.includes('cold') || msg.includes('cough') || msg.includes('sneez') || msg.includes('runny nose') || msg.includes('congestion'))
        return FALLBACK_RESPONSES.cold;
    if (msg.includes('fever') || msg.includes('temperature') || msg.includes('chills'))
        return FALLBACK_RESPONSES.fever;
    if (msg.includes('headache') || msg.includes('head pain') || msg.includes('migraine'))
        return FALLBACK_RESPONSES.headache;
    if (msg.includes('diabetes') || msg.includes('blood sugar') || msg.includes('insulin'))
        return FALLBACK_RESPONSES.diabetes;
    if (msg.includes('sleep') || msg.includes('insomnia') || msg.includes('can\'t sleep'))
        return FALLBACK_RESPONSES.sleep;
    if (msg.includes('burn') || msg.includes('scald'))
        return FALLBACK_RESPONSES.burn;

    return FALLBACK_RESPONSES.default;
}

// Initialize Gemini client
const getGeminiModel = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') return null;
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
};

async function getAIResponse(message, history) {
    const model = getGeminiModel();
    if (!model) return null;

    const geminiHistory = history.slice(0, -1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
    }));

    const chat = model.startChat({
        history: geminiHistory,
        systemInstruction: { role: 'user', parts: [{ text: SYSTEM_PROMPT }] }
    });

    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            const result = await chat.sendMessage(message.trim());
            return result.response.text();
        } catch (err) {
            const isRateLimit = err.status === 429 || String(err.message).includes('429') || String(err.message).includes('RESOURCE_EXHAUSTED');
            if (isRateLimit && attempt < 1) {
                await new Promise(r => setTimeout(r, 3000));
            } else {
                return null; // Fall back to local
            }
        }
    }
    return null;
}

export const chatWithAI = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { message, conversationId, saveHistory = true } = req.body;

        if (!message || !message.trim()) {
            return sendError(res, 'Message cannot be empty', 400);
        }

        if (!saveHistory) {
            const history = [{ role: 'user', content: message.trim() }];
            let aiResponse = await getAIResponse(message.trim(), history);
            if (!aiResponse) {
                aiResponse = getLocalResponse(message.trim());
            }

            return sendSuccess(res, {
                conversationId: null,
                message: aiResponse,
                messageId: null
            }, 'AI response generated');
        }

        let conversation;
        if (!conversationId) {
            conversation = new AIConversation({
                user_id: userId,
                title: message.substring(0, 50)
            });
            await conversation.save();
        } else {
            conversation = await AIConversation.findOne({ _id: conversationId, user_id: userId });
            if (!conversation) return sendError(res, 'Conversation not found', 404);
        }

        const userMsg = new AIMessage({
            conversation_id: conversation._id,
            role: 'user',
            content: message.trim()
        });
        await userMsg.save();

        const historyRows = await AIMessage.find({ conversation_id: conversation._id })
            .sort({ createdAt: 1 })
            .limit(20);

        const history = historyRows.map(m => ({ role: m.role, content: m.content }));

        let aiResponse = await getAIResponse(message.trim(), history);
        if (!aiResponse) {
            aiResponse = getLocalResponse(message.trim());
        }

        const aiMsg = new AIMessage({
            conversation_id: conversation._id,
            role: 'assistant',
            content: aiResponse
        });
        await aiMsg.save();

        sendSuccess(res, {
            conversationId: conversation._id,
            message: aiResponse,
            messageId: aiMsg._id
        }, 'AI response generated');
    } catch (error) {
        sendError(res, `AI chat error: ${error.message}`, 500);
    }
};

export const getConversationHistory = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { conversationId } = req.params;

        const conv = await AIConversation.findOne({ _id: conversationId, user_id: userId });
        if (!conv) return sendError(res, 'Conversation not found', 404);

        const messages = await AIMessage.find({ conversation_id: conversationId }).sort({ createdAt: 1 });

        sendSuccess(res, messages, 'Conversation history fetched');
    } catch (error) {
        sendError(res, 'Error fetching conversation history', 500, error);
    }
};

export const getUserConversations = async (req, res) => {
    try {
        const userId = req.user.userId;
        const conversations = await AIConversation.find({ user_id: userId }).sort({ createdAt: -1 }).limit(20);

        // Add last message for each conversation
        const results = await Promise.all(conversations.map(async conv => {
            const lastMsg = await AIMessage.findOne({ conversation_id: conv._id }).sort({ createdAt: -1 });
            return {
                ...conv.toObject(),
                lastMessage: lastMsg ? lastMsg.content : ''
            };
        }));

        sendSuccess(res, results, 'Conversations fetched');
    } catch (error) {
        sendError(res, 'Error fetching conversations', 500, error);
    }
};

export const deleteConversation = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { conversationId } = req.params;

        const conv = await AIConversation.findOneAndDelete({ _id: conversationId, user_id: userId });
        if (!conv) return sendError(res, 'Conversation not found', 404);

        await AIMessage.deleteMany({ conversation_id: conversationId });

        sendSuccess(res, null, 'Conversation deleted');
    } catch (error) {
        sendError(res, 'Error deleting conversation', 500, error);
    }
};

export const symptomCheck = async (req, res) => {
    try {
        const { symptoms } = req.body;

        if (!Array.isArray(symptoms) || symptoms.length === 0) {
            return sendError(res, 'symptoms must be a non-empty array', 400);
        }

        const cleanedSymptoms = symptoms
            .map((item) => `${item}`.trim())
            .filter(Boolean)
            .slice(0, 20);

        if (cleanedSymptoms.length === 0) {
            return sendError(res, 'Provide valid symptom text', 400);
        }

        const analysis = await analyzeSymptoms(cleanedSymptoms);
        const specFilters = (analysis.recommendedSpecializations || []).slice(0, 3);

        let recommendedDoctors = [];
        if (specFilters.length > 0) {
            const regexList = specFilters.map((s) => new RegExp(s, 'i'));
            recommendedDoctors = await User.find({
                role: 'doctor',
                isActive: { $ne: false },
                $or: regexList.map((rx) => ({ specialization: rx }))
            })
                .select('_id fullName specialization consultationFee city profileImage rating')
                .limit(6);
        }

        sendSuccess(res, {
            symptoms: cleanedSymptoms,
            ...analysis,
            recommendedDoctors
        }, 'Symptom analysis complete');
    } catch (error) {
        sendError(res, `Symptom analysis failed: ${error.message}`, 500);
    }
};

