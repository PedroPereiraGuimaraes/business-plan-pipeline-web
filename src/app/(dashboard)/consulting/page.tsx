"use client";

import useSWR from 'swr';
import { Plus, ChevronRight, Trash2 } from 'lucide-react';
import styles from '../projects/page.module.css'; // Reusing styles
import { consultingService, ConsultingRequest } from '@/services/consulting';

export default function ConsultingHome() {
    const { data: consultingList = [], error, isLoading, mutate } = useSWR('/consulting', consultingService.getAll);

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja deletar esta consultoria?")) return;
        try {
            await consultingService.delete(id);
            mutate(consultingList.filter(c => c.id !== id), false);
        } catch (err: any) {
            alert(err.response?.data?.detail || "Erro ao deletar consultoria");
        }
    };

    const getStatusStyle = (status: string) => {
        if (!status) return styles.statusBadgeDraft;
        const s = status.toLowerCase();
        if (s.includes("agendada") || s.includes("scheduled")) return styles.statusBadgeScheduled;
        if (s.includes("andamento") || s.includes("progress")) return styles.statusBadgeProgress;
        if (s.includes("finalizad") || s.includes("done")) return styles.statusBadgeDone;
        return styles.statusBadgeDraft;
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div className={styles.pageTitleBlock}>
                    <h1 className={styles.pageTitle}>Minhas Consultorias</h1>
                    <p className={styles.pageSubtitle}>Acompanhe suas sessões e mentorias estratégicas.</p>
                </div>
                <button className={styles.primaryButton}>
                    <Plus size={18} strokeWidth={2} />
                    Nova Consultoria
                </button>
            </div>

            <div className={styles.cardsList}>
                {isLoading ? (
                    <p style={{ color: "var(--foreground-muted)", marginTop: "1rem" }}>Carregando sessões...</p>
                ) : consultingList.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--foreground-muted)' }}>
                        {error ? (
                            <p style={{ color: "var(--danger)" }}>{error?.response?.data?.detail || "Erro ao carregar dados"}</p>
                        ) : (
                            <>
                                <p style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Nenhuma consultoria encontrada.</p>
                                <p style={{ fontSize: '0.9rem' }}>Clique em "Nova Consultoria" para agendar uma mentoria.</p>
                            </>
                        )}
                    </div>
                ) : (
                    consultingList.map((consult) => (
                        <div className={styles.card} key={consult.id}>
                            <div className={styles.cardContent}>
                                <h3 className={styles.cardTitle}>{consult.title}</h3>
                                <p className={styles.cardDescription}>{consult.description || "Sem detalhes disponíveis."}</p>
                            </div>
                            <div className={styles.cardMeta}>
                                <span className={getStatusStyle(consult.status)}>{consult.status?.toUpperCase() || "AGENDADA"}</span>
                                <span className={styles.dateText}>{consult.scheduled_at ? new Date(consult.scheduled_at).toLocaleDateString() : "Sem data"}</span>
                                <button className={styles.deleteButton} onClick={(e) => { e.stopPropagation(); handleDelete(consult.id); }} title="Deletar Consultoria">
                                    <Trash2 size={18} strokeWidth={1.5} />
                                </button>
                                <button className={styles.arrowButton}><ChevronRight size={18} strokeWidth={1.5} /></button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
