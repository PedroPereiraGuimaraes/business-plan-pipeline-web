"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth";
import styles from "./page.module.css";

export default function Register() {
    const router = useRouter();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await authService.register({
                name: fullName,
                email,
                password
            });

            // Redirect to login after successful registration
            router.push("/login?registered=true");
        } catch (err: any) {
            console.error("Registration error:", err);
            setError(err.response?.data?.detail || "Erro ao criar conta. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.logoContainerWrapper}>
                <img
                    src="/assets/logo.png"
                    alt="Business Plan Pipeline Logo"
                    style={{ maxHeight: '60px', width: 'auto', objectFit: 'contain' }}
                />
            </div>

            <div className={`${styles.loginCard} animate-fade-in`}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Criar Conta</h1>
                    <p className={styles.subtitle}>Preencha seus dados para começar</p>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: '#fee2e2',
                        color: '#b91c1c',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        fontSize: '0.85rem',
                        fontWeight: 500
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.formContainer}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="fullName" className={styles.label}>Nome Completo</label>
                        <div className={styles.inputWrapper}>
                            <input
                                id="fullName"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Seu nome"
                                required
                                className={styles.input}
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.label}>E-mail</label>
                        <div className={styles.inputWrapper}>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="exemplo@email.com"
                                required
                                className={styles.input}
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.label}>Senha</label>
                        <div className={styles.inputWrapper}>
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className={styles.input}
                            />
                            <button
                                type="button"
                                className={styles.eyeButton}
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    {showPassword ? (
                                        <>
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                        </>
                                    ) : (
                                        <>
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </>
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div style={{ marginTop: "0.25rem", marginBottom: "0.25rem" }} />

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className={styles.loadingSpinner} />
                        ) : (
                            "Criar Minha Conta"
                        )}
                    </button>
                </form>

                <div className={styles.footer}>
                    <span className={styles.footerText}>Já tem uma conta?</span>
                    <Link href="/login" className={styles.signUpLink}>Fazer Login</Link>
                </div>
            </div>
        </div>
    );
}
