import { FloatButton } from "antd";
import { ReloadOutlined, PushpinOutlined } from "@ant-design/icons";
import { WindowSetAlwaysOnTop, WindowReloadApp } from "../wailsjs/runtime";
import { useEffect, useState } from "react";

const FixedTool = () => {
    const [isStickWindow, setIsStickWindow] = useState<boolean>(false);

    const stickWindowButtonOnClick = () => {
        setIsStickWindow(!isStickWindow);
    };

    const refreshWindowButtonOnclick = () => {
        WindowSetAlwaysOnTop(false);
        WindowReloadApp();
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

    return (
        <FloatButton.Group shape="circle">
            <FloatButton
                style={{ insetInlineEnd: 24 }}
                icon={<ReloadOutlined />}
                tooltip="重新载入"
                onClick={refreshWindowButtonOnclick}
            />
            <FloatButton
                shape="circle"
                type={isStickWindow ? "primary" : "default"}
                style={{ insetInlineEnd: 24 }}
                icon={<PushpinOutlined />}
                tooltip={isStickWindow ? "取消置顶" : "置顶窗口"}
                onClick={stickWindowButtonOnClick}
            />
        </FloatButton.Group>
    );
};

export default FixedTool;
