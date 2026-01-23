import { Link, Typography } from "@arco-design/web-react";
import { Flex } from "antd";
import { githubUrl } from "../constants/Some";

const Agreement = () => {
    const { Title, Paragraph, Text } = Typography;
    return (
        <Flex vertical style={{ width: "100%", height: "100%" }}>
            <Typography style={{ marginTop: -36 }}>
                <Title heading={5}>使用须知</Title>
                <Paragraph>
                    本项目仅用于学习与技术交流，请勿用于任何违法违规用途。使用本项目所产生的一切风险与后果均由使用者自行承担，与作者无关。
                </Paragraph>
                <Title heading={5}>关于隐私</Title>
                <Paragraph>
                    本项目在设计与实现上
                    <Text style={{ fontWeight: 800 }}>
                        不包含任何形式的数据获取行为
                    </Text>
                    ，包括但不限于：账号、密码、验证码、Cookie、Token
                    等敏感信息的获取、记录、上传或共享。项目运行过程所需的相关信息均由用户自行输入并仅在本地处理，作者无法也不会以任何方式获取用户隐私数据。
                </Paragraph>
                <Title heading={5}>开源地址</Title>
                <Paragraph>
                    本项目已在 Github 开源，项目地址：
                    <Link target="_blank" href={githubUrl}>
                        {githubUrl}
                    </Link>
                </Paragraph>
            </Typography>
        </Flex>
    );
};

export default Agreement;
