"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, UserPlus } from 'lucide-react';
import styles from './page.module.css';

export default function LandingPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if token exists to auto-login
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      router.push('/projects');
    } else {
      setIsChecking(false);
    }
  }, [router]);

  if (isChecking) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff'
      }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5c8356]"></div>
      </div>
    );
  }

  return (
    <div className={styles.landingPage}>
      {/* Animated Background Elements */}
      <div className={styles.bgCanvas}>
        <div className={`${styles.blob} ${styles.blob1}`}></div>
        <div className={`${styles.blob} ${styles.blob2}`}></div>
        <div className={`${styles.blob} ${styles.blob3}`}></div>
      </div>

      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.logoArea}>
          <img src="/assets/logo.png" alt="Business Plan Pipeline" />
        </div>
        <div className={styles.navLinks}>
          <Link href="/login" className={styles.navBtn}>
            <LogIn size={18} />
            <span>Entrar</span>
          </Link>
          <Link href="/register" className={styles.navBtnPrimary}>
            <UserPlus size={18} />
            <span>Começar</span>
          </Link>
        </div>
      </nav>

      {/* Hero Section - Centered Container with Left Aligned Content */}
      <section className={styles.heroLayout}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Transforme sua ideia em um <span>Plano de Negócios</span> em minutos.
          </h1>
          <p className={styles.heroDescription}>
            Para qualquer tipo de empresa. Rápido, profissional e pronto para apresentar.
          </p>
          <div className={styles.ctaGroup}>
            <Link href="/register" className={styles.primaryCta}>
              Criar meu plano agora
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>&copy; 2026 Business Plan Pipeline. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
