"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

const suggestions = [
    {
        title: "Explicar conceptos",
        desc: "Explica de forma sencilla cómo funciona un API REST.",
        prompt: "Explica de forma sencilla cómo funciona un API REST y qué métodos HTTP utiliza."
    },
    {
        title: "Escribir código",
        desc: "Escribe una función en TypeScript para validar un email.",
        prompt: "Escribe una función de TypeScript completa para validar direcciones de correo electrónico, con explicaciones paso a paso."
    },
    {
        title: "Optimizar rendimiento",
        desc: "Consejos para mejorar el rendimiento de Next.js.",
        prompt: "¿Cuáles son las 3 mejores prácticas para optimizar el rendimiento y tiempos de carga de una aplicación Next.js?"
    },
    {
        title: "Corregir código",
        desc: "Encuentra el error en este bucle en JavaScript.",
        prompt: "Encuentra el error en el siguiente código y explícame cómo solucionarlo:\n\nconst items = [1, 2, 3];\nitems.forEach(async (item) => {\n  await doSomething(item);\n});\nconsole.log('Completado');"
    }
];

function ChatComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const conversationId = searchParams.get("id");

    const [conversations, setConversations] = useState<string[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [provider, setProvider] = useState<"mock" | "openai">("mock");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    // Fetch conversation list on mount
    const fetchConversations = async () => {
        try {
            const res = await fetch("/api/chat");
            if (res.ok) {
                const data = await res.json();
                setConversations(data.conversations || []);
            }
        } catch (err) {
            console.error("Error al obtener conversaciones:", err);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    // Set conversation ID and load history on mount / route change
    useEffect(() => {
        if (!conversationId) {
            // Generate a default unique conversation ID
            const newId = `web-${Date.now()}`;
            router.replace(`/chat?id=${newId}`);
        } else {
            const fetchHistory = async () => {
                try {
                    const res = await fetch(`/api/chat?conversationId=${conversationId}`);
                    if (res.ok) {
                        const data = await res.json();
                        // Ignore system messages in the rendering list
                        const history: ChatMessage[] = (data.history || []).filter(
                            (m: any) => m.role !== "system"
                        );
                        setMessages(history);
                    } else {
                        setMessages([]);
                    }
                } catch (err) {
                    console.error("Error al obtener el historial:", err);
                    setMessages([]);
                }
            };
            fetchHistory();
        }
    }, [conversationId, router]);

    const handleNewChat = () => {
        const newId = `web-${Date.now()}`;
        router.push(`/chat?id=${newId}`);
        setSidebarOpen(false);
    };

    const handleDeleteConversation = async (e: React.MouseEvent, idToDelete: string) => {
        e.stopPropagation();
        e.preventDefault();
        
        if (!confirm("¿Estás seguro de que deseas eliminar esta conversación?")) {
            return;
        }

        try {
            const res = await fetch(`/api/chat?conversationId=${idToDelete}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setConversations(prev => prev.filter(c => c !== idToDelete));
                if (idToDelete === conversationId) {
                    const newId = `web-${Date.now()}`;
                    router.push(`/chat?id=${newId}`);
                }
            } else {
                alert("Error al intentar eliminar la conversación.");
            }
        } catch (err) {
            console.error("Error al eliminar conversación:", err);
        }
    };

    const sendMessage = async (messageText: string) => {
        if (!messageText.trim() || !conversationId || isLoading) return;

        const userMsg: ChatMessage = { role: "user", content: messageText };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        const assistantMsg: ChatMessage = { role: "assistant", content: "" };
        setMessages(prev => [...prev, assistantMsg]);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    conversationId,
                    message: messageText,
                    provider
                })
            });

            if (!response.ok || !response.body) {
                throw new Error("No se pudo obtener respuesta del servidor.");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let done = false;
            let currentText = "";

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                if (value) {
                    const chunk = decoder.decode(value, { stream: !done });
                    currentText += chunk;
                    setMessages(prev => {
                        const updated = [...prev];
                        if (updated.length > 0) {
                            updated[updated.length - 1] = {
                                role: "assistant",
                                content: currentText
                            };
                        }
                        return updated;
                    });
                }
            }

            // Sync sidebar conversation list
            await fetchConversations();
        } catch (err: any) {
            console.error("Error de streaming:", err);
            setMessages(prev => {
                const updated = [...prev];
                if (updated.length > 0) {
                    updated[updated.length - 1] = {
                        role: "assistant",
                        content: `⚠️ Error: No se pudo obtener respuesta. ${err.message || ""}`
                    };
                }
                return updated;
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    const handleSendSuggestion = (promptText: string) => {
        sendMessage(promptText);
    };

    // Helper to format messages (code block styling)
    const renderMessageContent = (content: string) => {
        if (!content) return null;
        
        const parts = content.split(/(```[\s\S]*?```)/g);

        return parts.map((part, index) => {
            if (part.startsWith("```") && part.endsWith("```")) {
                const match = part.match(/```(\w*)\n([\s\S]*?)```/);
                const language = match ? match[1] : "";
                const code = match ? match[2] : part.slice(3, -3);

                return (
                    <div key={index} className="code-block-wrapper">
                        {language && <div className="code-block-header">{language}</div>}
                        <pre className="code-block">
                            <code>{code.trim()}</code>
                        </pre>
                    </div>
                );
            }

            const inlineParts = part.split(/(`[^`\n]+`)/g);
            return (
                <span key={index} style={{ whiteSpace: "pre-wrap" }}>
                    {inlineParts.map((subPart, subIndex) => {
                        if (subPart.startsWith("`") && subPart.endsWith("`")) {
                            return (
                                <code key={subIndex} className="inline-code">
                                    {subPart.slice(1, -1)}
                                </code>
                            );
                        }
                        return subPart;
                    })}
                </span>
            );
        });
    };

    return (
        <div className="chat-layout">
            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
                <div className="sidebar-header">
                    <Link href="/" className="logo-link">
                        <svg viewBox="0 0 24 24" className="sidebar-logo-icon">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                        </svg>
                        <span>Conexión Terminal</span>
                    </Link>
                    <button className="btn-new-chat" onClick={handleNewChat}>
                        <svg viewBox="0 0 24 24" style={{ width: "16px", height: "16px", fill: "currentColor" }}>
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                        </svg>
                        <span>Nuevo Chat</span>
                    </button>
                </div>

                <div className="sidebar-content">
                    <div className="history-label">Historial de Conversaciones</div>
                    <div className="conversations-list">
                        {conversations.length === 0 ? (
                            <div className="no-conversations">No hay chats guardados</div>
                        ) : (
                            conversations.map(id => (
                                <div
                                    key={id}
                                    className={`conversation-item ${id === conversationId ? "active" : ""}`}
                                    onClick={() => {
                                        router.push(`/chat?id=${id}`);
                                        setSidebarOpen(false);
                                    }}
                                >
                                    <svg viewBox="0 0 24 24" className="chat-icon">
                                        <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                                    </svg>
                                    <span className="conversation-title">
                                        {id.startsWith("web-") ? `Sesión ${id.replace("web-", "")}` : id}
                                    </span>
                                    <button
                                        className="btn-delete-conv"
                                        onClick={(e) => handleDeleteConversation(e, id)}
                                        title="Eliminar chat"
                                    >
                                        <svg viewBox="0 0 24 24" className="delete-icon">
                                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                        </svg>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="sidebar-footer">
                    <div className="provider-selector-wrapper">
                        <label>Proveedor IA:</label>
                        <select
                            value={provider}
                            onChange={(e) => setProvider(e.target.value as "mock" | "openai")}
                            className="provider-select"
                        >
                            <option value="mock">Simulado (Mock)</option>
                            <option value="openai">OpenAI (API)</option>
                        </select>
                    </div>
                </div>
            </aside>

            {/* Backdrop for mobile */}
            {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

            {/* Main Chat Content */}
            <main className="main-chat">
                <header className="chat-header">
                    <button className="btn-menu-toggle" onClick={() => setSidebarOpen(true)}>
                        <svg viewBox="0 0 24 24" style={{ width: "24px", height: "24px", fill: "currentColor" }}>
                            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
                        </svg>
                    </button>
                    <div className="chat-header-info">
                        <h2>{conversationId ? (conversationId.startsWith("web-") ? `Sesión ${conversationId.replace("web-", "")}` : conversationId) : "Nueva Conversación"}</h2>
                        <span className={`badge ${provider}`}>{provider === "openai" ? "OpenAI" : "Mock LLM"}</span>
                    </div>
                </header>

                <div className="messages-container">
                    {messages.length === 0 ? (
                        <div className="empty-state">
                            <div className="ai-logo empty-logo">
                                <svg viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                                </svg>
                            </div>
                            <h1>¿En qué puedo ayudarte hoy?</h1>
                            <p className="subtitle">Elige una sugerencia o escribe un mensaje para iniciar la conversación de forma premium.</p>

                            <div className="suggestions-grid">
                                {suggestions.map((s, idx) => (
                                    <div key={idx} className="suggestion-card" onClick={() => handleSendSuggestion(s.prompt)}>
                                        <h3>{s.title}</h3>
                                        <p>{s.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="messages-list">
                            {messages.map((m, idx) => (
                                <div key={idx} className={`message-bubble ${m.role}`}>
                                    <div className="message-avatar">
                                        {m.role === "user" ? "👤" : "🤖"}
                                    </div>
                                    <div className="message-content">
                                        {renderMessageContent(m.content)}
                                    </div>
                                </div>
                            ))}
                            {isLoading && messages.length > 0 && messages[messages.length - 1].role === "user" && (
                                <div className="message-bubble assistant">
                                    <div className="message-avatar">🤖</div>
                                    <div className="message-content">
                                        <div className="streaming-dots">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                <div className="input-container">
                    <div className="input-box-wrapper">
                        <textarea
                            rows={1}
                            placeholder="Escribe un mensaje aquí..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                            className="chat-textarea"
                        />
                        <button
                            className={`btn-send ${input.trim() && !isLoading ? "active" : ""}`}
                            onClick={() => sendMessage(input)}
                            disabled={!input.trim() || isLoading}
                        >
                            <svg viewBox="0 0 24 24" style={{ width: "20px", height: "20px", fill: "currentColor" }}>
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                        </button>
                    </div>
                    <div className="input-helper">Presiona Enter para enviar. Shift+Enter para salto de línea.</div>
                </div>
            </main>
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={<div className="loading-screen">Cargando la interfaz de chat...</div>}>
            <ChatComponent />
        </Suspense>
    );
}
