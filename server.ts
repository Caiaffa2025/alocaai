import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Initialize Gemini Client
const getGeminiAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY environment variable is not defined");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Response Schema for Payment Parsing
const paymentSchema = {
  type: Type.OBJECT,
  properties: {
    amount: {
      type: Type.NUMBER,
      description: "Valor numérico do pagamento em Reais (BRL). Exemplo: 120.50",
    },
    description: {
      type: Type.STRING,
      description: "Descrição clara e concisa do pagamento efetuado em português.",
    },
    date: {
      type: Type.STRING,
      description: "Data do pagamento no formato YYYY-MM-DD. Se o usuário disse 'hoje', 'ontem', 'segunda passada', calcule com base na data atual fornecida.",
    },
    method: {
      type: Type.STRING,
      description: "Tipo/forma de pagamento. Deve ser rigorosamente um destes: 'pix', 'credit_card', 'debit_card', 'cash', 'bank_transfer', 'boleto', 'other'.",
    },
    category: {
      type: Type.STRING,
      description: "Categoria de alocação do pagamento. Deve ser rigorosamente um destes: 'alimentacao', 'moradia', 'transporte', 'saude', 'educacao', 'lazer', 'compras', 'servicos', 'impostos', 'outros'.",
    },
    recipient: {
      type: Type.STRING,
      description: "Nome do estabelecimento, fornecedor ou pessoa que recebeu o pagamento, se mencionado.",
    },
    confidence: {
      type: Type.NUMBER,
      description: "Grau de confiança da interpretação de 0.0 a 1.0.",
    },
    explanation: {
      type: Type.STRING,
      description: "Breve explicação amigável em português confirmando os dados identificados.",
    },
  },
  required: ["amount", "description", "date", "method", "category", "explanation"],
};

// API Endpoint to parse text spoken or typed
app.post("/api/parse-payment", async (req, res) => {
  try {
    const { prompt, currentDate } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "O texto do pagamento é obrigatório." });
    }

    const ai = getGeminiAI();
    const today = currentDate || new Date().toISOString().split("T")[0];

    const systemInstruction = `Você é um assistente financeiro especialista em interpretar relatos em português de pagamentos efetuados.
A data atual de referência é: ${today}.
Sua tarefa é analisar o relato do usuário (falado ou digitado) e extrair:
1. Valor exato em Reais (BRL).
2. Descrição clara do que foi pago.
3. Data exata no formato YYYY-MM-DD. Se disser 'hoje' use ${today}. Se 'ontem', subtraia 1 dia de ${today}. Se especificar dia/mês (ex: 'dia 5', '10/08'), use o ano atual.
4. Tipo/Método de pagamento (pix, credit_card, debit_card, cash, bank_transfer, boleto, ou outro). Se não mencionado explicitamente, infira com base no contexto (ex: "aluguel" costuma ser pix/boleto/bank_transfer, "almoço" costuma ser debit_card/pix/credit_card, "dinheiro" é cash).
5. Categoria de alocação (alimentacao, moradia, transporte, saude, educacao, lazer, compras, servicos, impostos, outros).
6. Estabelecimento/Recebedor se identificável.
7. Explicação resumida e simpática em português.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: paymentSchema,
        temperature: 0.1,
      },
    });

    const text = response.text?.trim() || "";
    const parsedData = JSON.parse(text);

    return res.json({ success: true, result: parsedData });
  } catch (error: any) {
    console.error("Erro no processamento de pagamento via Gemini:", error);
    return res.status(500).json({
      error: "Falha ao interpretar o pagamento.",
      details: error?.message || "Erro interno",
    });
  }
});

// API Endpoint to parse audio recording directly
app.post("/api/parse-audio-payment", async (req, res) => {
  try {
    const { audioBase64, mimeType, currentDate } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: "Áudio não fornecido." });
    }

    const ai = getGeminiAI();
    const today = currentDate || new Date().toISOString().split("T")[0];

    const audioPart = {
      inlineData: {
        mimeType: mimeType || "audio/webm",
        data: audioBase64,
      },
    };

    const textPrompt = {
      text: `Ouça atentamente a gravação em português onde o usuário relata um pagamento realizado.
A data de referência hoje é: ${today}.
Extraia com precisão o valor, a descrição, a data (YYYY-MM-DD), o tipo de pagamento e a categoria de alocação.`,
    };

    const systemInstruction = `Você é um assistente financeiro especialista em transcrição e estruturação de áudios de pagamentos em português.
Interprete o áudio e responda EXATAMENTE conforme a estrutura JSON solicitada.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: { parts: [audioPart, textPrompt] },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: paymentSchema,
        temperature: 0.1,
      },
    });

    const text = response.text?.trim() || "";
    const parsedData = JSON.parse(text);

    return res.json({ success: true, result: parsedData });
  } catch (error: any) {
    console.error("Erro no processamento de áudio via Gemini:", error);
    return res.status(500).json({
      error: "Falha ao processar o áudio do pagamento.",
      details: error?.message || "Erro interno",
    });
  }
});

// API Endpoint for AI Financial Insights
app.post("/api/financial-insights", async (req, res) => {
  try {
    const { transactions } = req.body;

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return res.json({
        insights: [
          "Adicione seus primeiros pagamentos para receber análises inteligentes sobre seus gastos e alocações!",
        ],
      });
    }

    const ai = getGeminiAI();

    const summary = transactions.map((t) => ({
      val: t.amount,
      desc: t.description,
      data: t.date,
      metodo: t.method,
      cat: t.category,
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `Analise o histórico de pagamentos a seguir em português do Brasil:
${JSON.stringify(summary, null, 2)}

Forneça de 3 a 5 observações práticas, estratégicas e encorajadoras sobre a alocação destes pagamentos (ex: concentração por tipo de pagamento como Pix ou Cartão de Crédito, maiores categorias de custo, padrões de data e dicas de economia).
Retorne em formato JSON como uma lista de strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de 3 a 5 insights financeiros curtos em português.",
            },
          },
          required: ["insights"],
        },
      },
    });

    const text = response.text?.trim() || "{}";
    const data = JSON.parse(text);

    return res.json({ insights: data.insights || [] });
  } catch (error: any) {
    console.error("Erro ao gerar insights:", error);
    return res.json({
      insights: [
        "Sua alocação de pagamentos está bem distribuída. Continue registrando para manter o controle!",
      ],
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor AlocaPag rodando na porta ${PORT}`);
  });
}

startServer();
