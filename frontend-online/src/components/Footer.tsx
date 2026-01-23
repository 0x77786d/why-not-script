import { Tag } from "@arco-design/web-react";
import { IconClockCircle, IconUser } from "@arco-design/web-react/icon";
import { Flex } from "antd";
import React from "react";

const Footer: React.FC<{ user: string; term: string }> = ({ user, term }) => {
    return (
        <Flex gap="small">
            <Tag color="arcoblue" icon={<IconClockCircle />}>
                {term}
            </Tag>
            <Tag color="blue" icon={<IconUser />}>
                {user}
            </Tag>
        </Flex>
    );
};

export default Footer;
