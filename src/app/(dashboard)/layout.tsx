"use client";

import { usePathname, useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { FolderOpen, GraduationCap, User as UserIcon, ChevronRight, ChevronLeft, Crown, LogOut } from 'lucide-react';
import styles from './layout.module.css';
import { UserProvider, useUser } from '@/contexts/UserContext';
import useSWR from 'swr';
import { projectsService } from '@/services/projects';

function InnerLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const params = useParams<{ id?: string }>();
    const { user, isLoading } = useUser();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch project if we are on a project page
    const { data: project } = useSWR(
        params?.id ? `/projects/${params.id}` : null,
        () => params?.id ? projectsService.getById(params.id) : null
    );

    const isProjetos = pathname.includes('/projects');
    const isConsultoria = pathname.includes('/consulting');
    const isNew = pathname.includes('/new');

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = '/login'; // Use window.location to force full reload and clear state
    };

    if (isLoading) {
        return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Carregando...</div>;
    }

    return (
        <div className={styles.layoutRoot}>
            {!isNew && (
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <div className={styles.headerLogoSection}>
                            <img src="/assets/logo.png" alt="Logo" style={{ maxHeight: '56px', width: 'auto', objectFit: 'contain' }} />
                        </div>
                        <div className={styles.breadcrumb}>
                            {isProjetos && !params?.id && (
                                <>
                                    <span>Projetos</span>
                                    <ChevronRight size={16} strokeWidth={1.5} />
                                    <span className={styles.breadcrumbActive}>Home</span>
                                </>
                            )}
                            {isProjetos && params?.id && (
                                <>
                                    <Link href="/projects" style={{ color: 'var(--foreground-muted)', textDecoration: 'none' }}>Projetos</Link>
                                    <ChevronRight size={16} strokeWidth={1.5} />
                                    <span className={pathname.includes('/plan') ? '' : styles.breadcrumbActive}>
                                        {project?.name || project?.title || 'Carregando...'}
                                    </span>
                                    {pathname.includes('/plan') && (
                                        <>
                                            <ChevronRight size={16} strokeWidth={1.5} />
                                            <span className={styles.breadcrumbActive}>Plano de negócios</span>
                                        </>
                                    )}
                                </>
                            )}
                            {isConsultoria && (
                                <>
                                    <span>Consultoria</span>
                                    <ChevronRight size={16} strokeWidth={1.5} />
                                    <span className={styles.breadcrumbActive}>Home</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className={styles.userSectionContainer} ref={dropdownRef}>
                        <div className={styles.userSection} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
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

                        {isDropdownOpen && (
                            <div className={styles.userDropdown}>
                                <button className={styles.logoutBtn} onClick={handleLogout}>
                                    <LogOut size={16} strokeWidth={2} />
                                    Sair
                                </button>
                            </div>
                        )}
                    </div>
                </header>
            )}

            <div className={styles.layoutContainer}>
                <aside className={styles.sidebar}>
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
                    <div className={`${styles.contentArea} ${isNew ? styles.contentAreaCentered : ''}`}>
                        {children}
                    </div>
                </main>
            </div>
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
