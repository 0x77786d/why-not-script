import { useEffect, useRef, useState, type CSSProperties } from "react";
import FixedTool from "./FixedTool";
import {
    WindowIsMaximised,
    WindowToggleMaximise,
    WindowReloadApp,
} from "../wailsjs/runtime";
import OnlineFrame from "./OnlineFrame";
import { Tag } from "@arco-design/web-react";

function App() {
    const [isWindowMaximised, setIsWindowMaximised] = useState<boolean>(false);
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
                    <OnlineFrame />
                </div>
            </div>
        </div>
    );
}

export default App;
