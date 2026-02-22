"use client";

import { use, useState, useEffect, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import styles from './page.module.css';
import { projectsService } from '@/services/projects';

function extractHeadings(md: string): { id: string; text: string; level: number }[] {
    return md.split('\n')
        .map(line => {
            const trimmed = line.trim();
            const m2 = trimmed.match(/^## (.+)/);
            const m1 = trimmed.match(/^# (.+)/);
            if (m2) return { text: m2[1].trim(), level: 2, id: slugify(m2[1]) };
            if (m1) return { text: m1[1].trim(), level: 1, id: slugify(m1[1]) };
            return null;
        })
        .filter(Boolean) as { id: string; text: string; level: number }[];
}

function slugify(t: string) {
    return t.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

function PlanContent({ id }: { id: string }) {
    const router = useRouter();
    const [activeId, setActiveId] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    const { data: plan, error, isLoading } = useSWR(
        `/projects/${id}/plan`,
        () => projectsService.getPlan(id)
    );

    const markdown: string = typeof plan === 'string'
        ? plan
        : plan?.content_markdown ?? plan?.content ?? plan?.plan ?? '';

    const headings = markdown ? extractHeadings(markdown) : [];

    // Scroll spy
    useEffect(() => {
        const el = scrollRef.current;
        if (!el || !markdown) return;
        const observer = new IntersectionObserver(
            entries => {
                const vis = entries.filter(e => e.isIntersecting);
                if (vis.length) setActiveId(vis[0].target.id);
            },
            { root: el, rootMargin: '-5% 0px -85% 0px', threshold: 0 }
        );
        const nodes = el.querySelectorAll('h1[id], h2[id]');
        nodes.forEach(n => observer.observe(n));
        return () => observer.disconnect();
    }, [markdown]);

    const scrollTo = (id: string) => {
        scrollRef.current?.querySelector(`[id="${id}"]`)
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    if (isLoading) return (
        <div className={styles.center}>
            <Loader2 size={28} className="animate-spin" style={{ color: 'var(--primary)' }} />
            <p>Carregando plano...</p>
        </div>
    );

    if (error || !markdown) return (
        <div className={styles.center}>
            <AlertCircle size={28} style={{ color: 'var(--danger)' }} />
            <p style={{ color: 'var(--danger)' }}>
                {error?.response?.data?.detail || 'Plano ainda não disponível.'}
            </p>
        </div>
    );

    return (
        <div className={styles.page}>
            {/* Section sidebar */}
            <aside className={styles.nav}>
                <div className={styles.navLogo}>
                    <button className={styles.backBtn} onClick={() => router.back()}>
                        <ChevronLeft size={18} />
                    </button>
                    <span className={styles.navTitle}>Plano de Negócios</span>
                </div>
                <div className={styles.navLinks}>
                    {headings.map((h, idx) => {
                        // Keep the first H1 if it's NOT just the title, 
                        // but usually the first # is the document title.
                        // The user said "não pegava o primeiro #", if they want it, we show it.
                        // However, if we skip index 0, we avoid showing the title twice.
                        // Let's show all and let the user decide if they want to hide the first one.
                        return (
                            <button
                                key={`${h.id}-${idx}`}
                                onClick={() => scrollTo(h.id)}
                                className={[
                                    styles.navLink,
                                    h.level === 2 && styles.navLinkSub,
                                    h.level === 1 && styles.navLinkMain,
                                    activeId === h.id && styles.navLinkActive,
                                ].filter(Boolean).join(' ')}
                            >
                                {h.text}
                            </button>
                        );
                    })}
                </div>
            </aside>

            {/* Scrollable content */}
            <main className={styles.content} ref={scrollRef}>
                <div className={styles.prose}>
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            h1: ({ children }) => {
                                const id = slugify(String(children));
                                return <h1 id={id}>{children}</h1>;
                            },
                            h2: ({ children }) => {
                                const id = slugify(String(children));
                                return <h2 id={id}>{children}</h2>;
                            },
                        }}
                    >
                        {markdown}
                    </ReactMarkdown>
                </div>
            </main>
        </div>
    );
}

export default function PlanPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return (
        <Suspense fallback={
            <div className={styles.center}>
                <Loader2 size={28} className="animate-spin" style={{ color: 'var(--primary)' }} />
            </div>
        }>
            <PlanContent id={id} />
        </Suspense>
    );
}
