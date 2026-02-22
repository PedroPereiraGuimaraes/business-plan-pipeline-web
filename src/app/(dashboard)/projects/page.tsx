"use client";

import useSWR from 'swr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, ChevronRight, Trash2, PlayCircle } from 'lucide-react';
import styles from './page.module.css';
import { projectsService, Project } from '@/services/projects';

export default function ProjectsHome() {
    const router = useRouter();
    const { data: projects = [], error, isLoading, mutate } = useSWR('/projects', projectsService.getAll);

    const isOnboarding = (status: string) => !status || status.toLowerCase().includes('onboarding') || status.toLowerCase().includes('pending');
    const isReady = (status: string) => status?.toLowerCase().includes('ready') || status?.toLowerCase().includes('complete') || status?.toLowerCase().includes('done');

    const handleDelete = async (id: string) => {
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
                <Link href="/projects/new" className={styles.primaryButton}>
                    <Plus size={18} strokeWidth={2} />
                    Novo Projeto
                </Link>
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
                        <div className={styles.card} key={project.id}
                            onClick={() => isReady(project.status) ? router.push(`/projects/${project.id}`) : undefined}
                            style={{ cursor: isReady(project.status) ? 'pointer' : 'default' }}
                        >
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
                                {isOnboarding(project.status) ? (
                                    <button
                                        className={styles.resumeButton}
                                        onClick={(e) => { e.stopPropagation(); router.push(`/projects/new?projectId=${project.id}&step=1`); }}
                                        title="Retomar Onboarding"
                                    >
                                        <PlayCircle size={18} strokeWidth={1.5} />
                                    </button>
                                ) : isReady(project.status) ? (
                                    <button className={styles.arrowButton} onClick={(e) => { e.stopPropagation(); router.push(`/projects/${project.id}`); }}>
                                        <ChevronRight size={18} strokeWidth={1.5} />
                                    </button>
                                ) : (
                                    <button className={styles.arrowButton} disabled>
                                        <ChevronRight size={18} strokeWidth={1.5} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
