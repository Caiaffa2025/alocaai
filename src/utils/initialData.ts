import { PaymentTransaction } from "../types";

export function getInitialSampleTransactions(): PaymentTransaction[] {
  const now = new Date();
  
  const formatDate = (offsetDays: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - offsetDays);
    return d.toISOString().split('T')[0];
  };

  return [
    {
      id: "tx-1",
      amount: 245.80,
      description: "Supermercado Pão de Açúcar - Compras da semana",
      date: formatDate(0), // Hoje
      method: "credit_card",
      category: "alimentacao",
      recipient: "Pão de Açúcar",
      rawSpeechText: "Paguei 245 reais e 80 centavos de mercado no cartão de crédito hoje",
      createdAt: new Date().toISOString(),
    },
    {
      id: "tx-2",
      amount: 180.00,
      description: "Combustível Posto Shell",
      date: formatDate(1), // Ontem
      method: "pix",
      category: "transporte",
      recipient: "Posto Shell",
      rawSpeechText: "Fiz um Pix de 180 reais de gasolina no posto Shell ontem",
      createdAt: new Date().toISOString(),
    },
    {
      id: "tx-3",
      amount: 1850.00,
      description: "Aluguel e Condomínio do apartamento",
      date: formatDate(5),
      method: "pix",
      category: "moradia",
      recipient: "Imobiliária Central",
      rawSpeechText: "Paguei o aluguel de 1850 reais via Pix semana passada",
      createdAt: new Date().toISOString(),
    },
    {
      id: "tx-4",
      amount: 149.90,
      description: "Conta de Energia Elétrica Enel",
      date: formatDate(7),
      method: "boleto",
      category: "moradia",
      recipient: "Enel Distribuição",
      rawSpeechText: "Paguei o boleto da luz de 149 e 90",
      createdAt: new Date().toISOString(),
    },
    {
      id: "tx-5",
      amount: 85.00,
      description: "Farmácia Droga Raia - Remédios e vitaminas",
      date: formatDate(3),
      method: "debit_card",
      category: "saude",
      recipient: "Droga Raia",
      rawSpeechText: "Comprei remédio na farmácia por 85 reais no débito",
      createdAt: new Date().toISOString(),
    },
    {
      id: "tx-6",
      amount: 120.00,
      description: "Jantar Restaurante Outback com amigos",
      date: formatDate(2),
      method: "credit_card",
      category: "lazer",
      recipient: "Outback Steakhouse",
      rawSpeechText: "Paguei 120 reais no Outback no cartão de crédito",
      createdAt: new Date().toISOString(),
    },
    {
      id: "tx-7",
      amount: 55.00,
      description: "Assinatura Netflix e Spotify",
      date: formatDate(8),
      method: "credit_card",
      category: "servicos",
      recipient: "Streaming Services",
      rawSpeechText: "Caiu no cartão 55 reais das assinaturas",
      createdAt: new Date().toISOString(),
    },
    {
      id: "tx-8",
      amount: 40.00,
      description: "Padaria e Café da manhã em dinheiro",
      date: formatDate(0),
      method: "cash",
      category: "alimentacao",
      recipient: "Padaria Real",
      rawSpeechText: "Paguei 40 reais de padaria em dinheiro hoje de manhã",
      createdAt: new Date().toISOString(),
    },
  ];
}
