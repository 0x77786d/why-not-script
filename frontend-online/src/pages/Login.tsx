import {
    Tabs,
    Input,
    Button,
    Message,
    Alert,
    Link,
    Modal,
    Drawer,
} from "@arco-design/web-react";
import {
    IconUser,
    IconLock,
    IconSafe,
    IconLoading,
} from "@arco-design/web-react/icon";
import {
    CheckCircleFilled,
    CloseCircleFilled,
    ReloadOutlined,
} from "@ant-design/icons";
import { Flex, QRCode } from "antd";
import type { QRCodeProps } from "antd";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../http/client";
import {
    I_LOGIN,
    I_LOGIN_CHECK,
    I_LOGIN_MFA_CHECK,
    I_SERVER,
} from "../http/interface";
import GetTokenSteps from "../components/GetTokenSteps";
import Agreement from "../components/Agreement";
import isDev from "../components/isDev";
import { useUIStore } from "../store/ui";

const TabPane = Tabs.TabPane;

function LoginPage() {
    const readCountdownSeconds = isDev ? 0 : 5;

    const navigate = useNavigate();
    const defaultActiveTab = "token";
    const [activeTab, setActiveTab] = useState(defaultActiveTab);
    const [account, setAccount] = useState("");
    const [password, setPassword] = useState("");
    const [token, setToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    const [tokenStepsVisible, setTokenStepsVisible] = useState(false);
    const [drawerVisivle, setDrawerVisivle] = useState(true);
    const [readCountdown, setReadCountdown] = useState(readCountdownSeconds);
    const [readLoading, setReadLoading] = useState(true);
    const { hasReadAgreement, setHasReadAgreement } = useUIStore();
    const [secretVisible, setSecretVisible] = useState(false);
    const [secretValue, setSecretValue] = useState("");
    const [pendingTab, setPendingTab] = useState<string | null>(null);
    const [secretVerified, setSecretVerified] = useState(false);
    const [mfaVisible, setMfaVisible] = useState(false);
    const [mfaCallbackUrl, setMfaCallbackUrl] = useState("");
    const [mfaQrStatus, setMfaQrStatus] =
        useState<QRCodeProps["status"]>("active");
    const mfaTimerRef = useRef<number | null>(null);

    const stopMfaPolling = () => {
        if (mfaTimerRef.current !== null) {
            window.clearInterval(mfaTimerRef.current);
            mfaTimerRef.current = null;
        }
    };

    useEffect(() => {
        let cancelled = false;
        const timerId = window.setTimeout(async () => {
            while (!cancelled) {
                try {
                    const response = await client.request(I_SERVER);
                    if (response.success) {
                        client.request(I_LOGIN_CHECK).then((loginResponse) => {
                            if (cancelled) {
                                return;
                            }
                            setChecking(false);
                            if (loginResponse.success) {
                                navigate("/search");
                            }
                        });
                        break;
                    }
                } catch (error) {
                    if (cancelled) {
                        return;
                    }
                }
            }
        }, 250);

        return () => {
            cancelled = true;
            window.clearTimeout(timerId);
        };
    }, [navigate]);

    useEffect(() => {
        if (!drawerVisivle) {
            return;
        }
        if (hasReadAgreement) {
            setReadLoading(false);
            setReadCountdown(0);
            setDrawerVisivle(false);
            return;
        }
        setReadLoading(true);
        setReadCountdown(readCountdownSeconds);
        const intervalId = window.setInterval(() => {
            setReadCountdown((prev) => {
                if (prev <= 1) {
                    window.clearInterval(intervalId);
                    setReadLoading(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [drawerVisivle, hasReadAgreement, readCountdownSeconds]);

    useEffect(() => {
        return () => {
            stopMfaPolling();
        };
    }, []);

    if (checking) {
        return (
            <Flex
                style={{ width: "100%", height: "100%" }}
                justify="center"
                align="center"
                vertical
            >
                <IconLoading fontSize={32} />
                <p>正在初始化接口</p>
            </Flex>
        );
    }

    const startMfaPolling = () => {
        stopMfaPolling();

        const pollOnce = async () => {
            try {
                const response = await client.request(I_LOGIN_MFA_CHECK);
                if (response.success) {
                    stopMfaPolling();
                    setMfaVisible(false);
                    Message.success({ content: "登录成功" });
                    navigate("/search");
                    return;
                }

                if (response.msg === "scaned") {
                    setMfaQrStatus("scanned");
                    mfaTimerRef.current = window.setTimeout(pollOnce, 1500);
                    return;
                }
                if (response.msg === "pending") {
                    setMfaQrStatus("active");
                    mfaTimerRef.current = window.setTimeout(pollOnce, 1500);
                    return;
                }
                if (response.msg === "expired") {
                    stopMfaPolling();
                    setMfaQrStatus("expired");
                    return;
                }
                if (response.msg === "cancel") {
                    stopMfaPolling();
                    setMfaVisible(false);
                    Message.error({ content: "验证已取消" });
                    return;
                }

                stopMfaPolling();
                setMfaVisible(false);
                Message.error({ content: "验证失败，请重新登录" });
            } catch (error) {
                stopMfaPolling();
                setMfaVisible(false);
                Message.error({ content: "验证失败，请稍后重试" });
            }
        };

        mfaTimerRef.current = window.setTimeout(pollOnce, 1500);
    };

    const handleLogin = async () => {
        const isAccount = activeTab === "account";
        if (isAccount && (!account.trim() || !password.trim())) {
            Message.warning({
                content: "请输入帐号和密码",
            });
            return;
        }
        if (!isAccount && !token.trim()) {
            Message.warning({
                content: "请输入令牌",
            });
            return;
        }

        setLoading(true);
        const payload = isAccount
            ? { login_type: 1, user: account.trim(), pwd: password.trim() }
            : { login_type: 2, token: token.trim() };
        await client
            .request<{ callbackUrl?: string }>(I_LOGIN, payload)
            .then((response) => {
                if (response.success) {
                    Message.success({
                        content: "欢迎使用",
                    });
                    navigate("/search");
                    return;
                }
                if (response.errorCode === 1001 && response.data?.callbackUrl) {
                    setMfaCallbackUrl(response.data.callbackUrl);
                    setMfaQrStatus("active");
                    setMfaVisible(true);
                    startMfaPolling();
                    return;
                }
                Message.error({
                    content: response.msg || "登录失败，请稍后重试",
                });
            });
        setLoading(false);
    };

    const mfaStatusRender: QRCodeProps["statusRender"] = (info) => {
        if (info.status === "scanned") {
            return (
                <div style={{ color: "#16a34a", fontSize: 14 }}>
                    <CheckCircleFilled style={{ marginRight: 6 }} />
                    已扫码，请在手机上确认
                </div>
            );
        }
        if (info.status === "expired") {
            return (
                <Flex gap={8} vertical align="center">
                    <div style={{ color: "#dc2626", fontSize: 14 }}>
                        <CloseCircleFilled style={{ marginRight: 6 }} />
                        二维码已过期
                    </div>
                    <Button type="text" size="small" onClick={info.onRefresh}>
                        <ReloadOutlined style={{ marginRight: 4 }} />
                        重新获取
                    </Button>
                </Flex>
            );
        }
        return null;
    };

    return (
        <Flex
            style={{ height: "100%", width: "100%" }}
            align="center"
            justify="center"
        >
            <Modal
                style={{ width: 630 }}
                visible={drawerVisivle}
                // placement="bottom"
                focusLock={false}
                footer={
                    <Button
                        type="primary"
                        loading={readLoading}
                        disabled={readLoading}
                        onClick={() => {
                            setHasReadAgreement(true);
                            setDrawerVisivle(false);
                        }}
                    >
                        {readLoading
                            ? `不看也等着（${readCountdown}秒）`
                            : "我已阅读"}
                    </Button>
                }
                // title={null}
                closable={false}
                title={"WARNING"}
                unmountOnExit
            >
                <Agreement />
            </Modal>
            <div className="login-shell">
                <div className="brand">
                    <div className="brand-mark">O_o</div>
                    <div className="brand-text">
                        <div className="brand-title">Why Not Script</div>
                        <div className="brand-subtitle">抢到了你也不会学</div>
                    </div>
                </div>

                <Tabs
                    activeTab={activeTab}
                    onChange={(key) => {
                        const nextTab = String(key);
                        if (
                            nextTab === "account" &&
                            activeTab !== "account" &&
                            !secretVerified
                        ) {
                            setPendingTab(nextTab);
                            setSecretValue("");
                            setSecretVisible(true);
                            return;
                        }
                        setActiveTab(nextTab);
                    }}
                    type="rounded"
                    style={{
                        width: "100%",
                        justifyItems: "center",
                        marginTop: 20,
                    }}
                >
                    <TabPane key="account" title="帐号登录">
                        <Flex gap="middle" vertical>
                            <Input
                                prefix={<IconUser />}
                                placeholder="帐号"
                                allowClear
                                value={account}
                                onChange={setAccount}
                            />
                            <Input.Password
                                prefix={<IconLock />}
                                placeholder="密码"
                                allowClear
                                value={password}
                                onChange={setPassword}
                            />
                            <Button
                                type="primary"
                                long
                                loading={loading}
                                onClick={handleLogin}
                            >
                                登录
                            </Button>
                        </Flex>
                    </TabPane>
                    <TabPane key="token" title="令牌登录">
                        <Flex gap="middle" vertical>
                            <Alert
                                content="获取令牌步骤"
                                style={{ height: 32 }}
                                action={
                                    <Link
                                        hoverable={false}
                                        onClick={() =>
                                            setTokenStepsVisible(true)
                                        }
                                    >
                                        查看
                                    </Link>
                                }
                            />
                            <Input
                                prefix={<IconSafe />}
                                placeholder="令牌"
                                allowClear
                                value={token}
                                onChange={setToken}
                            />
                            <Button
                                type="primary"
                                long
                                loading={loading}
                                onClick={handleLogin}
                            >
                                登录
                            </Button>
                        </Flex>
                    </TabPane>
                </Tabs>
                <Modal
                    title="安全验证"
                    visible={mfaVisible}
                    footer={null}
                    style={{ width: 360 }}
                    onCancel={() => {
                        stopMfaPolling();
                        setMfaVisible(false);
                    }}
                    unmountOnExit
                >
                    <Flex gap={18} vertical align="center">
                        <QRCode
                            value={mfaCallbackUrl || "-"}
                            size={224}
                            status={mfaQrStatus}
                            onRefresh={() => {
                                stopMfaPolling();
                                setMfaVisible(false);
                                handleLogin();
                            }}
                            statusRender={mfaStatusRender}
                        />
                        <div
                            style={{
                                fontSize: 14,
                                color: "#6b7280",
                                lineHeight: 1.6,
                            }}
                        >
                            使用微信扫描二维码确认登录
                        </div>
                    </Flex>
                </Modal>
                <Modal
                    title="获取令牌步骤"
                    visible={tokenStepsVisible}
                    footer={null}
                    onCancel={() => setTokenStepsVisible(false)}
                    style={{ width: 880 }}
                    unmountOnExit
                >
                    <GetTokenSteps />
                </Modal>
                <Modal
                    title={"Hello"}
                    visible={secretVisible}
                    closable={false}
                    okText="OK"
                    cancelText="NO"
                    onOk={() => {
                        if (secretValue.trim() === "11408") {
                            setActiveTab(pendingTab ?? "account");
                            setSecretVisible(false);
                            setPendingTab(null);
                            setSecretVerified(true);
                            Message.success(secretValue);
                            Modal.info({
                                title: "注意事项",
                                content:
                                    "若使用帐号密码登录，不可与其他浏览器同时在线，否则先登录的一方会被挤下线。建议使用令牌登录，可与获取令牌所在的浏览器保持共存。",
                            });
                            return;
                        } else {
                            Message.info("?");
                        }
                        setSecretVisible(false);
                    }}
                    onCancel={() => {
                        setSecretVisible(false);
                        setPendingTab(null);
                    }}
                >
                    <Flex gap={"small"} vertical>
                        <Alert
                            // content="为保证用户隐私，暂不对外开放登录接口，请使用令牌登录！"
                            content="请在下方输入数一英一计算机统考代码"
                            type="info"
                            style={{ height: 32 }}
                        />
                        <Input
                            placeholder=""
                            allowClear
                            value={secretValue}
                            onChange={setSecretValue}
                        />
                    </Flex>
                </Modal>
            </div>
        </Flex>
    );
}

export default LoginPage;
