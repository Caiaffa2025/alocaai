import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Square,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Volume2,
  Calendar,
  CreditCard,
  Tag,
  DollarSign,
  FileText,
  Building,
  HelpCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import {
  ParsedPaymentAIResult,
  PaymentCategory,
  PaymentMethod,
  PAYMENT_CATEGORIES,
  PAYMENT_METHODS,
  PaymentTransaction,
} from '../types';

interface VoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTransaction: (transaction: Omit<PaymentTransaction, 'id' | 'createdAt'>) => void;
}

export const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
  isOpen,
  onClose,
  onSaveTransaction,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [parsedResult, setParsedResult] = useState<ParsedPaymentAIResult | null>(null);

  // Editable fields for user tweaking after AI parse
  const [editAmount, setEditAmount] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editDate, setEditDate] = useState<string>('');
  const [editMethod, setEditMethod] = useState<PaymentMethod>('pix');
  const [editCategory, setEditCategory] = useState<PaymentCategory>('alimentacao');
  const [editRecipient, setEditRecipient] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Speech Recognition Setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'pt-BR';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript.trim()) {
            setTranscript(currentTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          if (event.error !== 'no-speech') {
            setErrorMessage(`Aviso no reconhecimento de voz: ${event.error}`);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Sync edited state when AI result is received
  useEffect(() => {
    if (parsedResult) {
      setEditAmount(parsedResult.amount ? parsedResult.amount.toString() : '');
      setEditDescription(parsedResult.description || '');
      setEditDate(parsedResult.date || new Date().toISOString().split('T')[0]);
      setEditMethod(parsedResult.method || 'pix');
      setEditCategory(parsedResult.category || 'alimentacao');
      setEditRecipient(parsedResult.recipient || '');
      setEditNotes('');
    }
  }, [parsedResult]);

  if (!isOpen) return null;

  const startListening = async () => {
    setErrorMessage(null);
    setParsedResult(null);

    // Reset transcript if restarting
    if (!transcript) {
      setTranscript('');
    }

    try {
      // Start Web Speech API if supported
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // In case already started
        }
      }

      // Also setup MediaRecorder for audio sending fallback if speech recognition isn't enough
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
      }

      setIsListening(true);
    } catch (err: any) {
      console.error('Error starting recording:', err);
      setErrorMessage('Não foi possível acessar o microfone. Verifique as permissões do navegador.');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }

    setIsListening(false);
  };

  const handleProcessText = async (textToProcess?: string) => {
    const text = textToProcess || transcript;
    if (!text.trim()) {
      setErrorMessage('Por favor, fale ou digite a descrição do pagamento.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/parse-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          currentDate: new Date().toISOString().split('T')[0],
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Não foi possível processar o texto');
      }

      setParsedResult(data.result);

      // Speak feedback in Portuguese if available
      if ('speechSynthesis' in window && data.result?.explanation) {
        try {
          const utterance = new SpeechSynthesisUtterance(data.result.explanation);
          utterance.lang = 'pt-BR';
          window.speechSynthesis.speak(utterance);
        } catch (e) {}
      }
    } catch (err: any) {
      console.error('Error parsing payment:', err);
      setErrorMessage(
        err.message || 'Ocorreu um erro ao interpretar a alocação do pagamento com a IA.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessAudioBlob = async () => {
    if (audioChunksRef.current.length === 0) {
      handleProcessText();
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];

        const response = await fetch('/api/parse-audio-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: base64Audio,
            mimeType: 'audio/webm',
            currentDate: new Date().toISOString().split('T')[0],
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Falha ao processar o áudio');
        }

        setParsedResult(data.result);
        setIsProcessing(false);
      };

      reader.readAsDataURL(audioBlob);
    } catch (err: any) {
      console.error('Error processing audio blob:', err);
      // Fall back to processing text if text exists
      if (transcript.trim()) {
        handleProcessText();
      } else {
        setErrorMessage('Erro ao converter o áudio gravado.');
        setIsProcessing(false);
      }
    }
  };

  const handleConfirmAllocation = () => {
    const numAmount = parseFloat(editAmount.replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Por favor, informe um valor válido para o pagamento.');
      return;
    }

    if (!editDescription.trim()) {
      setErrorMessage('A descrição não pode ficar em branco.');
      return;
    }

    onSaveTransaction({
      amount: numAmount,
      description: editDescription,
      date: editDate || new Date().toISOString().split('T')[0],
      method: editMethod,
      category: editCategory,
      recipient: editRecipient.trim() || undefined,
      notes: editNotes.trim() || undefined,
      rawSpeechText: transcript || undefined,
    });

    // Reset and Close
    setTranscript('');
    setParsedResult(null);
    onClose();
  };

  const examplePhrases = [
    'Paguei 150 reais no supermercado com cartão de crédito hoje',
    'Fiz um Pix de 80 reais da conta de luz ontem',
    'Paguei 250 reais de combustível no posto no débito',
    'Paguei almoço de 45 reais em dinheiro',
    'Paguei a fatura do condomínio de 650 via boleto dia 05',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        id="voice-modal-container"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden transition-all my-8"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Alocação de Pagamento por Voz</h2>
              <p className="text-xs text-emerald-100">Fale livremente os detalhes do seu pagamento</p>
            </div>
          </div>
          <button
            id="close-voice-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Main Voice Recording Zone */}
          {!parsedResult && (
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-4 border-2 border-dashed border-emerald-200 dark:border-emerald-900/50 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 p-6">
              
              {/* Pulsing Mic Button */}
              <div className="relative">
                {isListening && (
                  <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" />
                )}
                <button
                  id="record-mic-toggle-btn"
                  onClick={isListening ? stopListening : startListening}
                  disabled={isProcessing}
                  className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg transform active:scale-95 ${
                    isListening
                      ? 'bg-rose-500 text-white ring-4 ring-rose-200 dark:ring-rose-900/50 animate-pulse'
                      : 'bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white ring-4 ring-emerald-100 dark:ring-emerald-900/40'
                  }`}
                >
                  {isListening ? (
                    <Square className="w-8 h-8 fill-current" />
                  ) : (
                    <Mic className="w-9 h-9" />
                  )}
                </button>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {isListening ? 'Escutando sua fala em Português...' : 'Clique no microfone para falar'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Fale o valor, tipo de pagamento (Pix, cartão, dinheiro, boleto), data e o que foi pago.
                </p>
              </div>

              {/* Transcript Display & Text Input */}
              <div className="w-full text-left space-y-2 mt-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                  <span>Transcrição da fala ou digitação:</span>
                  {transcript && (
                    <button
                      onClick={() => setTranscript('')}
                      className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      Limpar
                    </button>
                  )}
                </label>
                <textarea
                  id="voice-transcript-textarea"
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Ex: 'Paguei 120 reais de gasolina no cartão de débito hoje no Posto Ipiranga'"
                  className="w-full h-24 p-3 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 dark:text-white placeholder-slate-400 resize-none shadow-inner"
                />
              </div>

              {/* Action Submit Button */}
              <div className="flex flex-wrap items-center gap-3 w-full justify-end pt-2">
                <button
                  id="process-speech-btn"
                  onClick={() => handleProcessText()}
                  disabled={isProcessing || !transcript.trim()}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Alocando com IA...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Interpretar & Alocar Pagamento</span>
                    </>
                  )}
                </button>
              </div>

              {/* Example Speech Chips */}
              <div className="w-full text-left pt-3 border-t border-slate-200/60 dark:border-slate-800">
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Exemplos de frases que você pode falar:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {examplePhrases.map((phrase, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setTranscript(phrase);
                        handleProcessText(phrase);
                      }}
                      className="text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:border-emerald-300 dark:hover:bg-emerald-950/40 transition-colors text-left"
                    >
                      "{phrase}"
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* AI Result Confirmation Card & Field Tweaker */}
          {parsedResult && (
            <div className="space-y-5 animate-fadeIn">
              
              {/* AI Explanation Header */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex items-start gap-3">
                <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                    Pagamento Interpretado com Sucesso!
                  </h3>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1">
                    {parsedResult.explanation}
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                    Confiança da IA: {Math.round((parsedResult.confidence || 0.9) * 100)}% • Verifique ou edite os campos abaixo antes de confirmar.
                  </p>
                </div>
              </div>

              {/* Form Fields for Adjusting */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                
                {/* Amount */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    Valor (R$) *
                  </label>
                  <input
                    id="edit-amount-input"
                    type="text"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    placeholder="0,00"
                    className="w-full p-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900 dark:text-white"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    Data do Pagamento *
                  </label>
                  <input
                    id="edit-date-input"
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full p-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    Descrição do Pagamento *
                  </label>
                  <input
                    id="edit-description-input"
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Ex: Supermercado, Aluguel, Combustível"
                    className="w-full p-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                    Tipo de Pagamento *
                  </label>
                  <select
                    id="edit-method-select"
                    value={editMethod}
                    onChange={(e) => setEditMethod(e.target.value as PaymentMethod)}
                    className="w-full p-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  >
                    {Object.values(PAYMENT_METHODS).map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Allocation */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    Alocação / Categoria *
                  </label>
                  <select
                    id="edit-category-select"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as PaymentCategory)}
                    className="w-full p-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  >
                    {Object.values(PAYMENT_CATEGORIES).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Recipient / Vendor */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                    <Building className="w-3.5 h-3.5 text-emerald-600" />
                    Estabelecimento / Beneficiário
                  </label>
                  <input
                    id="edit-recipient-input"
                    type="text"
                    value={editRecipient}
                    onChange={(e) => setEditRecipient(e.target.value)}
                    placeholder="Ex: Carrefour, Posto Shell, Enel"
                    className="w-full p-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Speech context */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                    <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                    Relato falado original
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={transcript || 'Entrada direta'}
                    className="w-full p-2.5 text-xs bg-slate-200/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  id="retry-voice-parse-btn"
                  onClick={() => setParsedResult(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Gravar ou falar novamente</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    id="cancel-allocation-btn"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    id="confirm-allocation-btn"
                    onClick={handleConfirmAllocation}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-md flex items-center gap-2 transition-all transform active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmar Alocação</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
