import { useEffect, useRef, useState, type CSSProperties } from "react";
import FixedTool from "./FixedTool";
import {
    WindowIsMaximised,
    WindowToggleMaximise,
    WindowReloadApp,
} from "../wailsjs/runtime";
import OnlineFrame from "./OnlineFrame";
import { Button, Message, Tag } from "@arco-design/web-react";
import axios from "axios";

type VersionInfo = {
    version: string;
    minimumVersion: string;
    download: string;
    updated: string;
};

const CURRENT_VERSION = "26.3.6-released";

const compareVersions = (left: string, right: string): number => {
    const toParts = (value: string): Array<number | string> =>
        value
            .split(/[\.\-]/)
            .filter(Boolean)
            .map((part) => (/^\d+$/.test(part) ? Number(part) : part));

    const leftParts = toParts(left);
    const rightParts = toParts(right);
    const maxLen = Math.max(leftParts.length, rightParts.length);

    for (let i = 0; i < maxLen; i += 1) {
        const a = leftParts[i] ?? 0;
        const b = rightParts[i] ?? 0;
        if (a === b) {
            continue;
        }
        if (typeof a === "number" && typeof b === "number") {
            return a > b ? 1 : -1;
        }
        return String(a).localeCompare(String(b));
    }
    return 0;
};

function App() {
    const [isWindowMaximised, setIsWindowMaximised] = useState<boolean>(false);
    const [isVersionChecked, setIsVersionChecked] = useState(false);
    const [forceUpdateInfo, setForceUpdateInfo] = useState<VersionInfo | null>(
        null
    );
    const handleReloadIframe = () => {
        WindowReloadApp();
    };

    const handleMaximise = () => {
        const next = !isWindowMaximised;
        setIsWindowMaximised(next);
        WindowToggleMaximise();
        window.setTimeout(async () => {
            const maximised = await WindowIsMaximised();
            setIsWindowMaximised(maximised);
        }, 80);
    };

    useEffect(() => {
        const checkVersion = async () => {
            try {
                const { data } = await axios.get<VersionInfo>(
                    "https://api.rsky.net/wns/version"
                );
                if (
                    data?.minimumVersion &&
                    compareVersions(CURRENT_VERSION, data.minimumVersion) < 0
                ) {
                    setForceUpdateInfo(data);
                }
            } catch (_error) {
                Message.warning("版本检查失败，已跳过。");
            } finally {
                setIsVersionChecked(true);
            }
        };

        void checkVersion();
    }, []);

    useEffect(() => {
        const syncWindowState = async () => {
            const maximised = await WindowIsMaximised();
            setIsWindowMaximised(maximised);
        };
        void syncWindowState();
        window.addEventListener("focus", syncWindowState);
        return () => {
            window.removeEventListener("focus", syncWindowState);
        };
    }, []);

    const copyDownloadUrl = async () => {
        if (!forceUpdateInfo?.download) {
            return;
        }
        try {
            await navigator.clipboard.writeText(forceUpdateInfo.download);
            Message.success("下载地址已复制");
        } catch (_error) {
            Message.error("复制失败，请手动复制");
        }
    };

    const windowBorderRadius = 4;

    const titleBarStyle = {
        height: 40,
        background: "#f7f8fa",
        borderTopLeftRadius: isWindowMaximised ? 0 : windowBorderRadius,
        borderTopRightRadius: isWindowMaximised ? 0 : windowBorderRadius,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 8px 0 14px",
        userSelect: "none",
        "--wails-draggable": "drag",
        zIndex: 10000011,
    } as CSSProperties;

    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                background: "transparent",
                boxSizing: "border-box",
                padding: 0,
                overflow: "hidden",
                margin: 0,
            }}
        >
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    // border: "none",
                    border: "1px solid #77786d33",
                    borderRadius: isWindowMaximised ? 0 : windowBorderRadius,
                    overflow: "hidden",
                    boxSizing: "border-box",
                    background: "#ffffff",
                }}
            >
                <div style={titleBarStyle} onDoubleClick={handleMaximise}>
                    <span
                        style={{
                            fontSize: 15,
                            fontWeight: 800,
                            color: "#3d4a5d",
                            marginLeft: 4,
                        }}
                    >
                        why-not-script
                        <Tag style={{ marginLeft: 8 }} color="arcoblue">
                            localhost:2023
                        </Tag>
                    </span>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                        }}
                    >
                        <FixedTool
                            onReloadIframe={handleReloadIframe}
                            onWindowMaximisedChange={setIsWindowMaximised}
                        />
                    </div>
                </div>

                <div
                    style={{
                        height: "calc(100% - 40px)",
                        width: "100%",
                    }}
                >
                    {isVersionChecked && !forceUpdateInfo ? (
                        <OnlineFrame />
                    ) : null}

                    {!isVersionChecked ? (
                        <div
                            style={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#3d4a5d",
                                fontSize: 14,
                            }}
                        >
                            正在检查版本...
                        </div>
                    ) : null}

                    {isVersionChecked && forceUpdateInfo ? (
                        <div
                            style={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: 24,
                                boxSizing: "border-box",
                                background: "#f7f8fa",
                            }}
                        >
                            <div
                                style={{
                                    width: "100%",
                                    maxWidth: 560,
                                    background: "#fff",
                                    border: "1px solid #e5e6eb",
                                    borderRadius: 4,
                                    padding: 20,
                                    boxSizing: "border-box",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 18,
                                        fontWeight: 700,
                                        color: "#1d2129",
                                        marginBottom: 12,
                                    }}
                                >
                                    检测到更新
                                </div>
                                <div
                                    style={{
                                        lineHeight: "24px",
                                        color: "#4e5969",
                                    }}
                                >
                                    <div>当前版本: {CURRENT_VERSION}</div>
                                    <div>
                                        最新版本: {forceUpdateInfo.version}
                                    </div>
                                    <div>
                                        最低可用版本:{" "}
                                        {forceUpdateInfo.minimumVersion}
                                    </div>
                                    <div>
                                        更新时间: {forceUpdateInfo.updated}
                                    </div>
                                    <div
                                        style={{
                                            marginTop: 8,
                                            wordBreak: "break-all",
                                            color: "#165dff",
                                        }}
                                    >
                                        下载地址: {forceUpdateInfo.download}
                                    </div>
                                </div>
                                <div
                                    style={{
                                        marginTop: 16,
                                        display: "flex",
                                        gap: 8,
                                    }}
                                >
                                    <Button
                                        type="primary"
                                        onClick={copyDownloadUrl}
                                    >
                                        复制下载地址
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export default App;
