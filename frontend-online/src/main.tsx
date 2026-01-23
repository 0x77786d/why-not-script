import App from "./App";
import { createRoot } from "react-dom/client";
import "@arco-design/web-react/dist/css/arco.css";
import { Flex } from "antd";

const container = document.getElementById("root");

const root = createRoot(container!);

root.render(
    <Flex style={{height: '100%', width: '100%'}}>
        <App />
    </Flex>
);
