import {
    HashRouter,
    Routes,
    Route,
    Navigate,
    Outlet,
    useLocation,
    useNavigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { Button, Message } from "@arco-design/web-react";
import {
    IconSearch,
    IconList,
    IconQuestionCircle,
    IconExport,
    IconUserAdd,
} from "@arco-design/web-react/icon";
import LoginPage from "./pages/Login";
import SearchPage from "./pages/Search";
import QueuePage from "./pages/Queue";
import "./App.css";
import Footer from "./components/Footer";
import { Flex } from "antd";
import AboutPage from "./pages/About";
import client from "./http/client";
import { I_LOGIN_CHECK, I_LOGOUT } from "./http/interface";

function AppLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(false);

    const [footData, setFootData] = useState<{
        user: string;
        term: string;
    }>({ user: "", term: "" });

    useEffect(() => {
        client.request(I_LOGIN_CHECK).then((response) => {
            setIsLogin(response.success);
            if (response.success) {
                const data: any = response.data;
                setFootData(data);
            }
        });
    }, [location.pathname]);

    const handleLogout = () => {
        client.request(I_LOGOUT).then((response) => {
            if (response.success) {
                navigate("/");
                setIsLogin(false);
                Message.info("退出成功");
            } else {
                Message.info("退出失败");
            }
        });
    };

    return (
        <Flex className="app" vertical>
            <div className="app-content">
                <Outlet />
            </div>

            <Flex className="home-fab-menu">
                {isLogin && (
                    <>
                        <Button
                            className="fab-menu-btn"
                            icon={<IconSearch />}
                            onClick={() => navigate("/search")}
                        >
                            检索
                        </Button>
                        <Button
                            className="fab-menu-btn"
                            icon={<IconList />}
                            onClick={() => navigate("/queue")}
                        >
                            队列
                        </Button>
                        <Button
                            className="fab-menu-btn"
                            icon={<IconExport />}
                            onClick={() => handleLogout()}
                        >
                            退出
                        </Button>
                    </>
                )}

                {!isLogin && (
                    <Button
                        className="fab-menu-btn"
                        icon={<IconUserAdd />}
                        onClick={() => navigate("/")}
                    >
                        登录
                    </Button>
                )}
                <Button
                    className="fab-menu-btn"
                    icon={<IconQuestionCircle />}
                    onClick={() => navigate("/about")}
                >
                    关于
                </Button>
            </Flex>

            {isLogin && <Footer user={footData.user} term={footData.term} />}
        </Flex>
    );
}

function App() {
    return (
        <HashRouter>
            <div style={{ height: "100%", width: "100%" }}>
                <Routes>
                    <Route element={<AppLayout />}>
                        <Route path="/" element={<LoginPage />} />
                        <Route path="/search" element={<SearchPage />} />
                        <Route path="/queue" element={<QueuePage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                </Routes>
            </div>
        </HashRouter>
    );
}

export default App;
