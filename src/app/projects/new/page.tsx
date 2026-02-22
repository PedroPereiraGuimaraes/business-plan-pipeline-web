"use client";

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, ChevronLeft, Loader2, Check } from 'lucide-react';
import styles from './page.module.css';
import { projectsService } from '@/services/projects';

// ── Question definitions ──────────────────────────────────────────────────────
// apiLabel MUST match backend ONBOARDING_QUESTIONS list exactly
const ONBOARDING_QUESTIONS = [
    {
        id: "Q1",
        apiLabel: "problem",
        displayLabel: "Problema",
        placeholder: "Descreva de forma clara qual o problema principal que o seu projeto resolve...",
        hint: "Foque na dor do cliente.",
    },
    {
        id: "Q2",
        apiLabel: "proposed_solution",
        displayLabel: "Solução Proposta",
        placeholder: "Qual é a sua solução para o problema?",
        hint: "Como o seu produto age no dia-a-dia.",
    },
    {
        id: "Q3",
        apiLabel: "product_stage",
        displayLabel: "Estágio do Produto",
        placeholder: "Ideia, MVP, faturando, em escala inicial...",
        hint: "Seja transparente sobre o momento atual.",
    },
    {
        id: "Q4",
        apiLabel: "value_proposition",
        displayLabel: "Proposta de Valor",
        placeholder: "O que torna sua solução valiosa para quem compra?",
        hint: "O que você entrega de valor real?",
    },
    {
        id: "Q5",
        apiLabel: "competitive_advantage",
        displayLabel: "Diferencial Competitivo",
        placeholder: "O que te diferencia dos concorrentes?",
        hint: "Por que escolher você e não o outro?",
    },
    {
        id: "Q6",
        apiLabel: "team_structure",
        displayLabel: "Estrutura da Equipe",
        placeholder: "CEO - Nome, CTO - Nome...",
        hint: "Experiências e cargos atuais.",
    },
    {
        id: "Q7",
        apiLabel: "key_roles",
        displayLabel: "Principais Funções",
        placeholder: "Módulos X, Integração Y, Assinatura Z...",
        hint: "Quais features brilham?",
    },
    {
        id: "Q8",
        apiLabel: "location",
        displayLabel: "Localização/Atuação",
        placeholder: "Estado, País ou atuação virtual global.",
        hint: "Onde o projeto ocorre de fato?",
    },
    {
        id: "Q9",
        apiLabel: "available_capital",
        displayLabel: "Capital Disponível",
        placeholder: "Qual o capital inicial disponível?",
        hint: "Ex: R$ 10.000,00 ou Bootstrapped total.",
    },
    {
        id: "Q10",
        apiLabel: "cost_structure",
        displayLabel: "Estrutura de Custos",
        placeholder: "Quais são seus principais custos hoje e amanhã?",
        hint: "Servidores, funcionários, anúncios...",
    },
];

// ── Inner component (uses useSearchParams – must be inside Suspense) ──────────
function NewProjectContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // projectId comes from URL as a UUID string – never convert to Number
    const initialProjectId = searchParams.get('projectId') ?? null;
    const initialStep = Number(searchParams.get('step') ?? '0');

    const [step, setStep] = useState(initialStep);
    const [projectId, setProjectId] = useState<string | null>(initialProjectId);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [basicInfo, setBasicInfo] = useState({
        name: '', description: '', main_sector: '', business_model: ''
    });
    // answers keyed by apiLabel (matches backend field name)
    const [answers, setAnswers] = useState<Record<string, string>>({});

    const totalSteps = ONBOARDING_QUESTIONS.length + 1; // step 0 = basic info
    const progressPerc = step === 0 ? 0 : Math.round((step / ONBOARDING_QUESTIONS.length) * 100);
    const isLastStep = step === totalSteps - 1;
    const currentQ = step > 0 ? ONBOARDING_QUESTIONS[step - 1] : null;

    // ── On resume: load existing answers from API ─────────────────────────────
    // The backend pre-populates all 10 answers with "" on project creation.
    // We load them, restore existing responses, and jump to first empty answer.
    useEffect(() => {
        if (!initialProjectId) return;
        const load = async () => {
            try {
                const existing = await projectsService.getOnboarding(initialProjectId);
                const map: Record<string, string> = {};
                existing.forEach(a => {
                    // a.question is now the snake_case apiLabel, e.g. "problem"
                    if (a.answer) map[a.question] = a.answer;
                });
                setAnswers(map);

                // Jump to first question with an empty answer
                const firstEmpty = ONBOARDING_QUESTIONS.findIndex(q => !map[q.apiLabel]);
                setStep(firstEmpty === -1 ? totalSteps - 1 : firstEmpty + 1);
            } catch { /* silent – user starts from step 1 */ }
        };
        load();
    }, [initialProjectId]);

    // ── URL sync – keep URL in sync with current state ────────────────────────
    useEffect(() => {
        if (!projectId) return;
        const params = new URLSearchParams();
        params.set('projectId', projectId);
        params.set('step', String(step));
        router.replace(`/projects/new?${params.toString()}`, { scroll: false });
    }, [step, projectId]);

    // ── Save (PATCH) the current question's answer ────────────────────────────
    const saveCurrentAnswer = useCallback(async (pid: string, stepIndex: number) => {
        const q = ONBOARDING_QUESTIONS[stepIndex - 1];
        if (!q || !answers[q.apiLabel]) return;
        setIsSaving(true);
        try {
            await projectsService.patchAnswer(pid, q.apiLabel, answers[q.apiLabel]);
            setSaved(true);
            setTimeout(() => setSaved(false), 1500);
        } catch { /* silent – will retry on next navigation */ } finally {
            setIsSaving(false);
        }
    }, [answers]);

    // ── Navigation ────────────────────────────────────────────────────────────
    const handleNext = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (step === 0) {
                // Step 0: create the project; backend auto-creates 10 empty answers
                const newProj = await projectsService.create(basicInfo);
                setProjectId(newProj.id);
                setStep(1);
            } else if (step < totalSteps - 1) {
                // Intermediate steps: PATCH this answer then advance
                await saveCurrentAnswer(projectId!, step);
                setStep(s => s + 1);
            } else {
                // Last step: PATCH final answer then mark as complete
                await saveCurrentAnswer(projectId!, step);
                await projectsService.completeOnboarding(projectId!);
                router.push('/projects');
            }
        } catch (err: any) {
            alert(err.response?.data?.detail || "Ocorreu um erro.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        if (step === 0) {
            // Before project is created – cancel
            router.push('/projects');
        } else if (step === 1 && projectId) {
            // Project already exists – going back to step 0 makes no sense
            router.push('/projects');
        } else {
            // Navigate between onboarding questions
            setStep(s => s - 1);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className={styles.page}>

            {/* Back button – fixed top-left, outside card */}
            <button
                type="button"
                className={styles.backButton}
                onClick={handleBack}
                disabled={isLoading}
                title={step <= 1 ? "Ir para Projetos" : "Voltar"}
            >
                <ChevronLeft size={20} strokeWidth={2.5} />
            </button>

            <div className={styles.container}>

                {/* Progress */}
                <div className={styles.progressArea}>
                    <div className={styles.progressRow}>
                        <span>
                            {step === 0
                                ? "Novo Projeto"
                                : `Pergunta ${step} de ${ONBOARDING_QUESTIONS.length}`}
                        </span>
                        <span className={styles.progressPerc}>{progressPerc}%</span>
                    </div>
                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${progressPerc}%` }} />
                    </div>
                </div>

                {/* Title */}
                <div className={styles.titleArea}>
                    {step === 0 ? (
                        <>
                            <h1 className={styles.title}>Vamos criar seu projeto</h1>
                            <p className={styles.subtitle}>
                                Preencha as informações básicas para estruturar seu negócio.
                            </p>
                        </>
                    ) : (
                        <>
                            <h1 className={styles.title}>{currentQ!.displayLabel}</h1>
                            <p className={styles.subtitle}>{currentQ!.hint}</p>
                        </>
                    )}
                </div>

                {/* Form card */}
                <form className={styles.card} onSubmit={handleNext}>
                    {step === 0 ? (
                        <>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Nome do Projeto</label>
                                <input
                                    required type="text" className={styles.input}
                                    placeholder="Ex: Plataforma de Gestão Financeira"
                                    value={basicInfo.name}
                                    onChange={e => setBasicInfo({ ...basicInfo, name: e.target.value })}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Breve Descrição</label>
                                <input
                                    required type="text" className={styles.input}
                                    placeholder="Do que se trata em uma frase?"
                                    value={basicInfo.description}
                                    onChange={e => setBasicInfo({ ...basicInfo, description: e.target.value })}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Setor Principal</label>
                                <input
                                    required type="text" className={styles.input}
                                    placeholder="Ex: Finanças, Educação, IA..."
                                    value={basicInfo.main_sector}
                                    onChange={e => setBasicInfo({ ...basicInfo, main_sector: e.target.value })}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>
                                    Modelo de Negócio{' '}
                                    <span style={{ color: 'var(--foreground-muted)', fontWeight: 400 }}>
                                        (opcional)
                                    </span>
                                </label>
                                <select
                                    className={styles.select}
                                    value={basicInfo.business_model}
                                    onChange={e => setBasicInfo({ ...basicInfo, business_model: e.target.value })}
                                >
                                    <option value="">Selecione o modelo</option>
                                    <option value="B2B">B2B (Empresa para Empresa)</option>
                                    <option value="B2C">B2C (Empresa para Consumidor)</option>
                                    <option value="SaaS">SaaS (Software como Serviço)</option>
                                    <option value="Marketplace">Marketplace / Plataforma</option>
                                    <option value="E-commerce">E-commerce / Venda Direta</option>
                                    <option value="Físico">Loja/Serviço Físico</option>
                                    <option value="Outro">Outro</option>
                                </select>
                            </div>
                        </>
                    ) : (
                        <div className={styles.inputGroup}>
                            <textarea
                                required
                                autoFocus
                                className={styles.textarea}
                                placeholder={currentQ!.placeholder}
                                value={answers[currentQ!.apiLabel] || ''}
                                onChange={e =>
                                    setAnswers({ ...answers, [currentQ!.apiLabel]: e.target.value })
                                }
                            />
                            {isSaving && (
                                <span className={styles.savingText}>Salvando...</span>
                            )}
                            {saved && (
                                <span className={styles.savedText}>
                                    <Check size={12} /> Salvo
                                </span>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        className={styles.primaryButton}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : isLastStep ? (
                            <>Concluir Plano <ArrowRight size={18} /></>
                        ) : (
                            <>Próximo <ArrowRight size={18} /></>
                        )}
                    </button>

                    <p className={styles.helperText}>
                        {step > 0
                            ? "Sua resposta é salva automaticamente em cada passo."
                            : "Você poderá editar essas informações depois."}
                    </p>
                </form>
            </div>
        </div>
    );
}

// ── Export wrapped in Suspense (required by useSearchParams in Next.js) ───────
export default function NewProject() {
    return (
        <Suspense fallback={
            <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', minHeight: '100vh',
                color: 'var(--foreground-muted)'
            }}>
                Carregando...
            </div>
        }>
            <NewProjectContent />
        </Suspense>
    );
}
