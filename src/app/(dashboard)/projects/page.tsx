"use client";

import useSWR from 'swr';
import { Plus, ChevronRight, Trash2 } from 'lucide-react';
import styles from './page.module.css';
import { projectsService, Project } from '@/services/projects';

export default function ProjectsHome() {
    const { data: projects = [], error, isLoading, mutate } = useSWR('/projects', projectsService.getAll);

    const handleDelete = async (id: number) => {
        if (!confirm("Tem certeza que deseja deletar este projeto?")) return;
        try {
            await projectsService.delete(id);
            mutate(projects.filter(p => p.id !== id), false);
        } catch (err: any) {
            alert(err.response?.data?.detail || "Erro ao deletar projeto");
        }
    };

    const getStatusStyle = (status: string) => {
        if (!status) return styles.statusBadgeDraft;
        const s = status.toLowerCase();
        if (s.includes("andamento") || s.includes("progress")) return styles.statusBadgeProgress;
        if (s.includes("finalizad") || s.includes("done")) return styles.statusBadgeDone;
        return styles.statusBadgeDraft;
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div className={styles.pageTitleBlock}>
                    <h1 className={styles.pageTitle}>Meus Projetos</h1>
                    <p className={styles.pageSubtitle}>Gerencie seus planos de negócios e acompanhe o progresso.</p>
                </div>
                <button className={styles.primaryButton}>
                    <Plus size={18} strokeWidth={2} />
                    Novo Projeto
                </button>
            </div>

            <div className={styles.cardsList}>
                {isLoading ? (
                    <p style={{ color: "var(--foreground-muted)", marginTop: "1rem" }}>Carregando projetos...</p>
                ) : projects.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--foreground-muted)' }}>
                        {error ? (
                            <p style={{ color: "var(--danger)" }}>{error?.response?.data?.detail || "Erro ao carregar dados"}</p>
                        ) : (
                            <>
                                <p style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Nenhum projeto encontrado.</p>
                                <p style={{ fontSize: '0.9rem' }}>Clique em "Novo Projeto" para começar.</p>
                            </>
                        )}
                    </div>
                ) : (
                    projects.map((project) => (
                        <div className={styles.card} key={project.id}>
                            <div className={styles.cardContent}>
                                <h3 className={styles.cardTitle}>{project.name}</h3>
                                <p className={styles.cardDescription}>{project.description || "Sem descrição disponível."}</p>
                            </div>
                            <div className={styles.cardMeta}>
                                <span className={getStatusStyle(project.status)}>{project.status?.toUpperCase() || "RASCUNHO"}</span>
                                <span className={styles.dateText}>{project.created_at ? new Date(project.created_at).toLocaleDateString() : "Sem data"}</span>
                                <button className={styles.deleteButton} onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }} title="Deletar Projeto">
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
