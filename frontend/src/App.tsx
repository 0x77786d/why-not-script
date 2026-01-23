import { Flex } from "antd";
import { useState } from "react";
import FixedTool from "./FixedTool";
import OnlineFrame from "./OnlineFrame";

function App() {
    return (
        <Flex className="fullscreen">
            <OnlineFrame />
            <FixedTool />
        </Flex>
    );
}

export default App;
