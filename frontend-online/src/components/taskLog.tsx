import React, { useEffect, useRef, useState } from "react";
import client from "../http/client";
import { I_QUEUE_LOG } from "../http/interface";

type TaskLogProps = {
    taskID: string | number;
};

const POLL_INTERVAL_MS = 1000;
const USER_IDLE_MS = 1500;

const styles = {
    shell: {
        width: "100%",
        height: "180px",
        display: "flex",
        flexDirection: "column" as const,
        borderRadius: 14,
        color: "#D9DCE3",
        overflow: "hidden",
    },
    titleBar: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        background: "#222",
        position: "relative" as const,
    },
    title: {
        position: "absolute" as const,
        left: "50%",
        transform: "translateX(-50%)",
        fontSize: 13,
        letterSpacing: "0.06em",
        color: "#FFFFFF",
    },
    logBody: {
        flex: 1,
        padding: "16px 18px",
        overflowY: "auto" as const,
        background: "#000",
        fontFamily: '"SF Mono","Menlo","Consolas","Courier New",monospace',
        fontSize: 13,
        lineHeight: 1.6,
    },
    logLine: {
        color: "#D0D5DD",
        whiteSpace: "pre-wrap" as const,
    },
    empty: {
        color: "rgba(208,213,221,0.65)",
        fontStyle: "italic",
    },
};

const TaskLog: React.FC<TaskLogProps> = ({ taskID }) => {
    const [logs, setLogs] = useState<string[]>([]);
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const autoScrollRef = useRef(true);
    const userScrollTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        setLogs([]);
    }, [taskID]);

    useEffect(() => {
        let cancelled = false;

        const poll = async () => {
            try {
                const response = await client.request<string[]>(I_QUEUE_LOG, {
                    id: taskID,
                });
                if (cancelled) {
                    return;
                }
                if (response.success) {
                    setLogs(response.data || []);
                }
            } catch (error) {
                if (!cancelled) {
                    setLogs([]);
                }
            }
        };

        poll();
        const intervalId = setInterval(poll, POLL_INTERVAL_MS);
        return () => {
            cancelled = true;
            clearInterval(intervalId);
        };
    }, [taskID]);

    useEffect(() => {
        const container = scrollRef.current;
        if (!container || !autoScrollRef.current) {
            return;
        }
        requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight;
        });
    }, [logs]);

    useEffect(() => {
        const container = scrollRef.current;
        if (!container) {
            return;
        }

        const onUserScroll = () => {
            const nearBottom =
                container.scrollTop + container.clientHeight >=
                container.scrollHeight - 8;
            autoScrollRef.current = nearBottom;

            if (userScrollTimeoutRef.current) {
                window.clearTimeout(userScrollTimeoutRef.current);
            }

            if (!nearBottom) {
                userScrollTimeoutRef.current = window.setTimeout(() => {
                    autoScrollRef.current = true;
                    container.scrollTop = container.scrollHeight;
                }, USER_IDLE_MS);
            }
        };

        container.addEventListener("scroll", onUserScroll, {
            passive: true,
        });
        return () => {
            container.removeEventListener("scroll", onUserScroll);
            if (userScrollTimeoutRef.current) {
                window.clearTimeout(userScrollTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div style={styles.shell}>
            <div style={styles.titleBar}>
                <div style={styles.title}>task.log</div>
            </div>
            <div ref={scrollRef} style={styles.logBody}>
                {logs.length === 0 ? (
                    <div style={styles.empty}>Waiting for logs...</div>
                ) : (
                    logs.map((line, index) => (
                        <div key={`${index}-${line}`} style={styles.logLine}>
                            {line}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TaskLog;
