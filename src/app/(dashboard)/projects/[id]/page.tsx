"use client";

import { use } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import Link from 'next/link';
import { FileText, Download, TrendingUp, ChevronRight, ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import styles from './page.module.css';
import { projectsService } from '@/services/projects';

function scoreColor(score: number) {
    if (score >= 90) return '#22c55e';
    if (score >= 80) return '#eab308';
    return '#ef4444';
}

function ScoreColumn({ section_name, score }: { section_name: string; score: number }) {
    const color = scoreColor(score);
    const name = section_name.replace(/^\d+\.\s*/, '');

    return (
        <div className={styles.scoreCol}>
            <span className={styles.colLabel}>{name}</span>
            <div className={styles.colRow}>
                <div className={styles.colTrack}>
                    <div className={styles.colFill} style={{ width: `${score}%`, backgroundColor: color }} />
                </div>
                <span className={styles.colScore} style={{ color }}>{score}%</span>
            </div>
        </div>
    );
}

export default function ProjectAnalysisPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const { data: analysis, error, isLoading } = useSWR(
        `/projects/${id}/analysis`,
        () => projectsService.getAnalysis(id)
    );

    if (isLoading) {
        return (
            <div className={styles.centerState}>
                <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
                <p>Carregando análise...</p>
            </div>
        );
    }

    if (error || !analysis) {
        return (
            <div className={styles.centerState}>
                <AlertCircle size={32} style={{ color: 'var(--danger)' }} />
                <p style={{ color: 'var(--danger)' }}>
                    {error?.response?.data?.detail || 'Erro ao carregar a análise.'}
                </p>
            </div>
        );
    }

    const overall = analysis.overall_score;

    return (
        <div className={styles.pageGrid}>
            {/* ── MAIN COLUMN ─────────────────────────────────── */}
            <div className={styles.mainCol}>

                {/* Compact header */}
                <div className={styles.mainHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button className={styles.backBtn} onClick={() => router.back()}>
                            <ChevronLeft size={18} />
                        </button>
                        <div>
                            <h1 className={styles.pageTitle}>Análise do Plano</h1>
                            <p className={styles.pageSubtitle}>Resumo executivo e scores gerados por IA.</p>
                        </div>
                    </div>
                    <div className={styles.overallPill} style={{ borderColor: scoreColor(overall) + '60' }}>
                        <span className={styles.overallValue} style={{ color: scoreColor(overall) }}>{overall}</span>
                        <span className={styles.overallSub}>/ 100</span>
                    </div>
                </div>

                {/* Executive Summary */}
                <div className={styles.summaryCard}>
                    <div className={styles.cardHeader}>
                        <FileText size={14} strokeWidth={2} />
                        <span>Resumo Executivo</span>
                    </div>
                    <div className={styles.summaryContent}>
                        {analysis.executive_summary.split('\n\n').map((para: string, i: number) => (
                            <p key={i}>{para}</p>
                        ))}
                    </div>
                    <Link href={`/projects/${id}/plan`} className={styles.viewPlanBtn}>
                        Visualizar Plano Completo <ChevronRight size={14} />
                    </Link>
                </div>

                {/* Scores — no chart, pure list */}
                <div className={styles.analysisCard}>
                    <div className={styles.cardHeader}>
                        <TrendingUp size={14} strokeWidth={2} />
                        <span>Análise por Seção</span>
                    </div>
                    <div className={styles.scoresGrid}>
                        {analysis.sections.map((s: any) => (
                            <ScoreColumn key={s.section_name} {...s} />
                        ))}
                    </div>
                </div>
            </div>

            {/* ── SIDEBAR ─────────────────────────────────────── */}
            <aside className={styles.sidebar}>

                {/* Suggestions */}
                <div className={styles.suggestionsCard}>
                    <div className={styles.cardHeader}>
                        <span>💡</span>
                        <span>Sugestões de Melhoria</span>
                    </div>
                    <div className={styles.suggestionsList}>
                        {analysis.sections.map((s: any) =>
                            s.suggestions.length > 0 && (
                                <div key={s.section_name} className={styles.suggestionGroup}>
                                    {/* Section label */}
                                    <div className={styles.suggestionGroupHeader}>
                                        <span
                                            className={styles.sectionScore}
                                            style={{ color: scoreColor(s.score), backgroundColor: scoreColor(s.score) + '15' }}
                                        >
                                            {s.score}
                                        </span>
                                        <span className={styles.sectionLabel}>
                                            {s.section_name.replace(/^\d+\.\s*/, '')}
                                        </span>
                                    </div>
                                    {/* One card per suggestion */}
                                    {s.suggestions.map((sug: string, i: number) => (
                                        <div key={i} className={styles.suggestionCard}>
                                            <p className={styles.suggestionText}>{sug}</p>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* Export */}
                <div className={styles.exportCard}>
                    <Download size={18} strokeWidth={1.5} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    <div className={styles.exportText}>
                        <p className={styles.exportTitle}>Exportar Plano</p>
                        <p className={styles.exportSub}>PDF completo do seu plano</p>
                    </div>
                    <button className={styles.exportBtn} disabled>Em breve</button>
                </div>
            </aside>
        </div>
    );
}
