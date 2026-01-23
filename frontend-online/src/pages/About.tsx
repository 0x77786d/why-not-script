import { Link, Notification } from "@arco-design/web-react";
import { IconGithub } from "@arco-design/web-react/icon";
import { Flex } from "antd";
import { useEffect, useRef } from "react";
import { githubUrl } from "../constants/Some";

const AboutPage = () => {
    const messageRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const message1 = "顺手的事。";
        const message2 =
            "我们利用有限的业余时间开发了这份项目，<br/>虽然它并不那么美好，但正努力前行。";
        let displayedMessage = "";
        let phase: "typing1" | "pause1" | "deleting" | "typing2" = "typing1";
        let timerId: number | null = null;

        const updateView = (withCursor: boolean) => {
            if (!messageRef.current) {
                return;
            }
            messageRef.current.innerHTML =
                "<p>" + displayedMessage + (withCursor ? "_" : "") + "</p>";
        };

        const tick = () => {
            if (!messageRef.current) {
                return;
            }

            if (phase === "typing1") {
                if (displayedMessage.length < message1.length) {
                    displayedMessage += message1[displayedMessage.length];
                    updateView(true);
                    timerId = window.setTimeout(tick, 80);
                    return;
                }
                phase = "pause1";
                updateView(false);
                timerId = window.setTimeout(tick, 1000);
                return;
            }

            if (phase === "pause1") {
                phase = "deleting";
                timerId = window.setTimeout(tick, 50);
                return;
            }

            if (phase === "deleting") {
                if (displayedMessage.length > 0) {
                    displayedMessage = displayedMessage.slice(0, -1);
                    updateView(true);
                    timerId = window.setTimeout(tick, 50);
                    return;
                }
                phase = "typing2";
                timerId = window.setTimeout(tick, 100);
                return;
            }

            if (displayedMessage.length < message2.length) {
                displayedMessage += message2[displayedMessage.length];
                updateView(true);
                timerId = window.setTimeout(tick, 100);
                return;
            }

            updateView(false);
        };

        tick();

        return () => {
            if (timerId) {
                window.clearTimeout(timerId);
            }
        };
    }, []);

    return (
        <Flex className="about-page">
            <div className="about-shell">
                <div className="about-hero">
                    <div className="about-hero-left">
                        <div className="about-cover">
                            <div className="about-avatar"></div>
                            <div className="about-name">v我50</div>
                        </div>
                    </div>
                    <div
                        className="about-hero-right"
                        style={{ position: "relative" }}
                    >
                        <div
                            className="about-quote about-quote-typing"
                            ref={messageRef}
                        />

                        <Flex
                            style={{
                                position: "absolute",
                                bottom: 16,
                                right: 24,
                            }}
                            vertical
                            align="flex-end"
                        >
                            <Link
                                href={githubUrl}
                                icon={<IconGithub fontSize={16} />}
                                style={{ color: "#333", padding: 12 }}
                                target="_blank"
                            >
                                Github 开源地址
                            </Link>
                        </Flex>
                    </div>
                </div>
            </div>
        </Flex>
    );
};

export default AboutPage;
