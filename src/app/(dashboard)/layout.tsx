"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FolderOpen, GraduationCap, User as UserIcon, ChevronRight, Crown } from 'lucide-react';
import styles from './layout.module.css';
import { UserProvider, useUser } from '@/contexts/UserContext';

function InnerLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, isLoading } = useUser();

    const isProjetos = pathname.includes('/projects');
    const isConsultoria = pathname.includes('/consulting');

    if (isLoading) {
        return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Carregando...</div>;
    }

    return (
        <div className={styles.layoutContainer}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarLogo}>
                    <img src="/assets/logo.png" alt="Business Plan Pipeline Logo" style={{ maxHeight: '60px', width: '100%', objectFit: 'contain' }} />
                </div>

                <nav className={styles.navMenu}>
                    <Link href="/projects" className={`${styles.navItem} ${isProjetos ? styles.navItemActive : ''}`}>
                        <FolderOpen size={18} strokeWidth={1.5} className={isProjetos ? styles.activeIcon : ''} />
                        Projetos
                    </Link>
                    <Link href="/consulting" className={`${styles.navItem} ${isConsultoria ? styles.navItemActive : ''}`}>
                        <GraduationCap size={18} strokeWidth={1.5} className={isConsultoria ? styles.activeIcon : ''} />
                        Consultoria
                    </Link>
                </nav>
            </aside>

            <main className={styles.mainContent}>
                {!pathname.includes('/new') && (
                    <header className={styles.header}>
                        <div className={styles.breadcrumb}>
                            {isProjetos && (
                                <>
                                    <span>Projetos</span>
                                    <ChevronRight size={16} strokeWidth={1.5} />
                                    <span className={styles.breadcrumbActive}>{pathname.includes('/new') ? 'Novo Projeto' : 'Home'}</span>
                                </>
                            )}
                            {isConsultoria && (
                                <>
                                    <span>Consultoria</span>
                                    <ChevronRight size={16} strokeWidth={1.5} />
                                    <span className={styles.breadcrumbActive}>{pathname.includes('/new') ? 'Nova Consultoria' : 'Home'}</span>
                                </>
                            )}
                        </div>

                        <div className={styles.userSection}>
                            <div className={styles.userInfo}>
                                <span className={styles.userName}>{user?.name}</span>
                                <span className={styles.userRole}>
                                    {user?.access_level === 'premium' ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#eab308' }}>
                                            <Crown size={12} strokeWidth={2} />
                                            Premium
                                        </span>
                                    ) : "Plano Free"}
                                </span>
                            </div>
                            <div className={styles.userAvatar}>
                                <UserIcon size={18} strokeWidth={1.5} />
                            </div>
                        </div>
                    </header>
                )}

                <div className={`${styles.contentArea} ${pathname.includes('/new') ? styles.contentAreaCentered : ''}`}>
                    {children}
                </div>
            </main>
        </div>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <UserProvider>
            <InnerLayout>
                {children}
            </InnerLayout>
        </UserProvider>
    );
}
