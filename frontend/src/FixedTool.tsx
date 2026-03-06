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

const BorderMiniOutlined = () => {
    return (
        <svg
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="9012"
            width="14"
            height="14"
        >
            <path
                d="M890.41032533 75.09333333h-573.472768c-32.555008 0-59.04247467 26.279936-59.04247466 58.5728V255.91808H134.68194133c-32.56046933 0-59.04247467 26.279936-59.04247466 58.57826133v575.832064c0 32.29832533 26.48200533 58.57826133 59.04247466 58.57826134H708.149248c32.54954667 0 59.04247467-26.279936 59.04247467-58.57826134V768.07645867h123.21860266c32.555008 0 59.04247467-26.27447467 59.04247467-58.57826134v-575.832064c0-32.292864-26.48746667-58.5728-59.04247467-58.5728z m-188.82013866 808.72516267H141.24100267V321.00078933h560.349184V883.818496zM883.851264 702.99374933H767.19172267V314.49634133c0-32.29832533-26.492928-58.57826133-59.04247467-58.57826133H323.50208V140.17604267H883.851264V702.99374933z"
                fill="#2c2c2c"
                p-id="9013"
            ></path>
        </svg>
    );
};

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
