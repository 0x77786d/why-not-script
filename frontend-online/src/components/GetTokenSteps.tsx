import { useState, useRef } from "react";
import {
    Steps,
    Button,
    Divider,
    Image,
    Tag,
    Typography,
} from "@arco-design/web-react";
import { IconLeft, IconRight } from "@arco-design/web-react/icon";
import { Flex } from "antd";
const Step = Steps.Step;

function GetTokenSteps() {
    const [current, setCurrent] = useState(1);

    function renderContent(step: any) {
        return (
            <Flex
                vertical
                style={{ width: "100%", height: "100%" }}
                justify="center"
                align="center"
                gap="middle"
            >
                {step <= 3 && (
                    <Image
                        src={`../assets/s${step}.png`}
                        width={420}
                    />
                )}

                {/* <div style={{ lineHeight: "24px" }}>{stepDesc[step]}</div> */}

                {step == 1 && (
                    <div style={{ lineHeight: "24px" }}>
                        浏览器登录进入首页
                        <span style={{ fontWeight: 800 }}>
                            （点击图片可以放大查看）
                        </span>
                    </div>
                )}

                {step == 2 && (
                    <div style={{ lineHeight: "24px" }}>
                        按一下键盘的{" "}
                        <Tag size="small" color="red">
                            F12
                        </Tag>{" "}
                        键，打开控制台
                    </div>
                )}

                {step == 3 && (
                    <div style={{ lineHeight: "24px" }}>
                        根据图片序号依次点击找到{" "}
                        <Tag size="small" color="red">
                            Cookie Value
                        </Tag>{" "}
                        并复制，这个就是令牌
                    </div>
                )}

                {step == 4 && (
                    <div style={{ height: "314px" }}>
                        <Typography>
                            <Typography.Title>
                                下面这句话™认真看一下
                            </Typography.Title>
                            <Typography.Paragraph>
                                获取令牌之后
                                <Typography.Text style={{ fontWeight: 800 }}>
                                    可以
                                </Typography.Text>
                                和浏览器同时登陆使用，但是
                                <Typography.Text
                                    style={{ fontWeight: 800, fontSize: 48 }}
                                >
                                    不要
                                </Typography.Text>
                                再去其他地方登录或者在浏览器重新登陆（从智慧江财再次打开教务处
                                <Typography.Text style={{ fontWeight: 800 }}>
                                    也算
                                </Typography.Text>
                                重新登陆），否则软件会被挤下线，然后你需要在软件重新登陆。

                            </Typography.Paragraph>
                        </Typography>
                    </div>
                )}

                <div>
                    <Button
                        type="secondary"
                        disabled={current <= 1}
                        onClick={() => setCurrent(current - 1)}
                        style={{ paddingLeft: 8 }}
                    >
                        <IconLeft />
                        上一步
                    </Button>
                    <Button
                        disabled={current >= 4}
                        onClick={() => setCurrent(current + 1)}
                        style={{ marginLeft: 20, paddingRight: 8 }}
                        type="primary"
                    >
                        下一步
                        <IconRight />
                    </Button>
                </div>
            </Flex>
        );
    }

    return (
        <Flex>
            <div
                style={{
                    background: "var(--color-bg-2)",
                    padding: 12,
                    height: 360,
                    boxSizing: "border-box",
                }}
            >
                <Steps
                    direction="vertical"
                    current={current}
                    style={{ width: 150, height: 333 }}
                >
                    <Step title="Step 1" description="登录网站" />
                    <Step title="Step 2" description="打开控制台" />
                    <Step title="Step 3" description="获取令牌" />
                    <Step title="Step 4" description="注意事项" />
                </Steps>
            </div>
            <Divider
                type="vertical"
                style={{ display: "block", height: "auto" }}
            />
            {renderContent(current)}
        </Flex>
    );
}

export default GetTokenSteps;
