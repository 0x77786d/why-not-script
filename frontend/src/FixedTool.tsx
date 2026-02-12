import { Button, Input, Modal, Space, Tooltip, message } from "antd";
import {
    ReloadOutlined,
    PushpinOutlined,
    GiftOutlined,
    MinusOutlined,
    BorderOutlined,
    CloseOutlined,
} from "@ant-design/icons";
import {
    WindowIsFullscreen,
    WindowSetAlwaysOnTop,
    WindowFullscreen,
    WindowUnfullscreen,
    WindowGetSize,
    WindowSetSize,
    WindowMinimise,
    WindowToggleMaximise,
    WindowIsMaximised,
    Quit,
} from "../wailsjs/runtime";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { BorderMiniOutlined } from "./Iconfont";

type FixedToolProps = {
    onReloadIframe?: () => void;
    onWindowMaximisedChange?: (isMaximised: boolean) => void;
};

const FixedTool = ({
    onReloadIframe,
    onWindowMaximisedChange,
}: FixedToolProps) => {
    const [isStickWindow, setIsStickWindow] = useState<boolean>(false);
    const [isMaximised, setIsMaximised] = useState<boolean>(false);
    const windowSizeBeforeFullscreenRef = useRef<{ w: number; h: number }>();

    const clearAlwaysOnTop = () => {
        WindowSetAlwaysOnTop(false);
        setIsStickWindow(false);
        localStorage.setItem("isStickWindow", "false");
    };

    const stickWindowButtonOnClick = () => {
        setIsStickWindow((prev) => !prev);
    };

    const refreshWindowButtonOnclick = () => {
        onReloadIframe?.();
    };

    const refreshWindowState = async () => {
        const maximised = await WindowIsMaximised();
        setIsMaximised(maximised);
        onWindowMaximisedChange?.(maximised);
    };

    const minimiseWindow = () => {
        WindowMinimise();
    };

    const maximiseWindow = () => {
        clearAlwaysOnTop();
        const next = !isMaximised;
        setIsMaximised(next);
        onWindowMaximisedChange?.(next);
        WindowToggleMaximise();
        window.setTimeout(() => {
            void refreshWindowState();
        }, 80);
    };

    const closeWindow = () => {
        Quit();
    };

    useEffect(() => {
        const isStickWindowStorage =
            localStorage.getItem("isStickWindow") === "true";
        setIsStickWindow(isStickWindowStorage);
    }, []);

    useEffect(() => {
        WindowSetAlwaysOnTop(isStickWindow);
        localStorage.setItem("isStickWindow", String(isStickWindow));
    }, [isStickWindow]);

    useEffect(() => {
        void refreshWindowState();
        const onFocus = () => {
            void refreshWindowState();
        };
        window.addEventListener("focus", onFocus);
        return () => {
            window.removeEventListener("focus", onFocus);
        };
    }, []);

    useEffect(() => {
        const handleFullscreenChange = async () => {
            if (document.fullscreenElement) {
                const size = await WindowGetSize();
                windowSizeBeforeFullscreenRef.current = {
                    w: size.w,
                    h: size.h,
                };
                WindowFullscreen();
                return;
            }
            const isFullscreen = await WindowIsFullscreen();
            if (isFullscreen) {
                WindowUnfullscreen();
                const size = windowSizeBeforeFullscreenRef.current;
                if (size) {
                    WindowSetSize(size.w, size.h);
                }
            }
        };

        const handleKeyDown = async (event: KeyboardEvent) => {
            if (event.key !== "Escape" && event.key !== "F11") {
                return;
            }
            if (document.fullscreenElement) {
                await document.exitFullscreen();
            }
            const isFullscreen = await WindowIsFullscreen();
            if (isFullscreen) {
                WindowUnfullscreen();
                const size = windowSizeBeforeFullscreenRef.current;
                if (size) {
                    WindowSetSize(size.w, size.h);
                }
            }
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange
            );
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return (
        <>
            <div
                style={
                    {
                        display: "flex",
                        gap: 2,
                        "--wails-draggable": "no-drag",
                    } as CSSProperties
                }
            >
                <Tooltip title="重新载入">
                    <Button
                        type="text"
                        icon={<ReloadOutlined />}
                        onClick={refreshWindowButtonOnclick}
                    />
                </Tooltip>
                <Tooltip title={isStickWindow ? "取消置顶" : "置顶窗口"}>
                    <Button
                        type={isStickWindow ? "primary" : "text"}
                        icon={<PushpinOutlined />}
                        onClick={stickWindowButtonOnClick}
                    />
                </Tooltip>
                <Tooltip title="最小化">
                    <Button
                        type="text"
                        icon={<MinusOutlined />}
                        onClick={minimiseWindow}
                    />
                </Tooltip>
                <Tooltip title={isMaximised ? "还原" : "最大化"}>
                    <Button
                        type="text"
                        icon={
                            isMaximised ? (
                                <BorderMiniOutlined />
                            ) : (
                                <BorderOutlined />
                            )
                        }
                        onClick={maximiseWindow}
                    />
                </Tooltip>
                <Tooltip title="关闭">
                    <Button
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={closeWindow}
                        danger
                    />
                </Tooltip>
            </div>
        </>
    );
};

export default FixedTool;
