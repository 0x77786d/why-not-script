import { useEffect, useMemo, useState } from "react";
import { LoadConfig } from "../wailsjs/go/main/App";
import { Flex } from "antd";


type LoadState = "loading" | "loaded";

const LoadingIcon = () => (
    <Flex
        style={{ width: "100%", height: "100%" }}
        justify="center"
        align="center"
        vertical
    >
        <p style={{fontSize: 16}}>loading...</p>
    </Flex>
);

export default () => {
    const [webConfig, setWebConfig] = useState<any>();
    const [loadState, setLoadState] = useState<LoadState>("loading");
    const [reloadKey, setReloadKey] = useState(0);
    const [isReachable, setIsReachable] = useState(false);
    const clientAddress = useMemo(
        () => (webConfig ? webConfig.clientAddress : ""),
        [webConfig]
    );

    async function loadConfig() {
        while (true) {
            try {
                const webConfig = await LoadConfig();
                setWebConfig(webConfig);
                break;
            } catch (error) {
                console.error("error:", error);
            }
        }
    }

    useEffect(() => {
        loadConfig();
    }, []);

    useEffect(() => {
        if (!clientAddress) return;
        let cancelled = false;
        setIsReachable(false);
        setLoadState("loading");

        const tryReach = async () => {
            try {
                await fetch(`${clientAddress}?ping=${Date.now()}`, {
                    mode: "no-cors",
                });
                if (!cancelled) {
                    setIsReachable((prev) => {
                        if (prev) return prev;
                        setReloadKey((key) => key + 1);
                        return true;
                    });
                }
            } catch {
                if (!cancelled) {
                    setIsReachable(false);
                    setLoadState("loading");
                }
            }
        };

        tryReach();
        const timer = setInterval(tryReach, 2000);
        return () => {
            cancelled = true;
            clearInterval(timer);
        };
    }, [clientAddress]);

    return (
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
            {loadState === "loading" && <LoadingIcon />}
            <iframe
                key={`${clientAddress}-${reloadKey}`}
                src={isReachable ? clientAddress : "about:blank"}
                width="100%"
                height="100%"
                onLoad={() => {
                    if (isReachable) setLoadState("loaded");
                }}
                style={{
                    margin: 0,
                    padding: 0,
                    border: 0,
                    visibility: loadState === "loaded" ? "visible" : "hidden",
                }}
            />
        </div>
    );
};
