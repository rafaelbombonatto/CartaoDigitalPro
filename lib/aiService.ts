
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

// Inicialização segura
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Definição da Ferramenta de Pagamento (Function Calling)
export const checkoutTool: FunctionDeclaration = {
  name: 'criar_preferencia_mercadopago',
  description: 'Cria o corpo da preferência de pagamento do Mercado Pago Checkout Pro com back_urls e auto_return para o plano vitalício.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      user_id: {
        type: Type.STRING,
        description: 'ID único do usuário no Supabase (extraído do contexto da sessão).'
      },
      plan: {
        type: Type.STRING,
        description: 'Nome do plano de upgrade. Sempre deve ser "vitalicio" para este fluxo.'
      },
      amount_cents: {
        type: Type.INTEGER,
        description: 'Valor total do plano em centavos (ex: 4990 para R$ 49,90).'
      },
      base_url: {
        type: Type.STRING,
        description: 'A URL base da aplicação para configurar as back_urls de retorno do pagamento.'
      }
    },
    required: ['user_id', 'plan', 'amount_cents', 'base_url'],
  },
};

export const getAiAssistantResponse = async (userMessage: string, userId: string) => {
  const model = 'gemini-3-flash-preview';
  
  const systemInstruction = `Você é o Assistente Virtual do Cartão Digital Pro. 
  Seu objetivo é ajudar o usuário a entender as vantagens do Plano Vitalício (R$ 49,90 pagamento único).
  Vantagens: QR Code infinito, Link personalizado, Sem mensalidades, Suporte prioritário.
  Quando o usuário demonstrar que quer comprar ou fazer o upgrade, use a ferramenta 'criar_preferencia_mercadopago'.
  O user_id é: ${userId}. O plano é: 'vitalicio'. O valor é: 4990. A base_url é: ${window.location.origin}.`;

  const response = await ai.models.generateContent({
    model: model,
    contents: [{ parts: [{ text: userMessage }] }],
    config: {
      systemInstruction,
      tools: [{ functionDeclarations: [checkoutTool] }],
    },
  });

  return response;
};
