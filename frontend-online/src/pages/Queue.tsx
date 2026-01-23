import {
    Button,
    Descriptions,
    List,
    Message,
    Modal,
    Popconfirm,
    Tag,
} from "@arco-design/web-react";
import {
    IconCheck,
    IconClose,
    IconLoading,
    IconStop,
} from "@arco-design/web-react/icon";
import { Flex } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import client from "../http/client";
import {
    I_QUEUE_DELETE,
    I_QUEUE_LIST,
    I_QUEUE_STATUS,
} from "../http/interface";
import TaskLog from "../components/taskLog";

type QueueItem = {
    id: number;
    user: string;
    status: string;
    info: string;
    data: Record<string, unknown>;
    created: string;
};

const detailGroups: {
    title: string;
    fields: { label: string; key: string }[];
}[] = [
    {
        title: "基础信息",
        fields: [
            { label: "课程学分", key: "学分" },
            { label: "承担单位", key: "承担单位" },
            { label: "课程代码", key: "课程代码" },
            { label: "班级代码", key: "上课班号" },
            { label: "课程类别", key: "类别" },
        ],
    },
];

const getStatusMeta = (status: string) => {
    if (status === "active") {
        return { color: "blue", icon: <IconLoading />, label: "正在运行" };
    }
    if (status === "inactive") {
        return { color: "gray", icon: <IconStop />, label: "停止运行" };
    }
    if (status === "success") {
        return { color: "green", icon: <IconCheck />, label: "提交成功" };
    }
    if (status === "error") {
        return { color: "red", icon: <IconClose />, label: "处理异常" };
    }
    return { color: "", icon: <></>, label: "" };
};

function QueuePage() {
    const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
    const [detailVisible, setDetailVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<QueueItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const mapCourseName = useCallback((data?: Record<string, unknown>) => {
        return (
            (data?.["课程"] as string) || (data?.["课程名称"] as string) || "-"
        );
    }, []);

    const mapClassCode = useCallback((data?: Record<string, unknown>) => {
        return (
            (data?.["上课班号"] as string) ||
            (data?.["上课班级代码"] as string) ||
            "-"
        );
    }, []);

    const loadQueue = useCallback(async () => {
        try {
            const response = await client.request<QueueItem[]>(I_QUEUE_LIST);
            if (!response.success) {
                Message.error("获取队列失败");
                return;
            }
            setQueueItems(response.data || []);
        } catch (error) {
            Message.error("获取队列失败");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const timerId = window.setTimeout(() => {
            loadQueue();
        }, 250);
        return () => {
            window.clearTimeout(timerId);
        };
    }, [loadQueue]);

    useEffect(() => {
        const refreshQueueInterval = window.setInterval(() => {
            loadQueue();
        }, 2000);
        return () => {
            window.clearInterval(refreshQueueInterval);
        };
    }, [])

    const listData = useMemo(
        () =>
            queueItems.map((item) => ({
                id: item.id,
                courseName: mapCourseName(item.data),
                classCode: mapClassCode(item.data),
                status: item.status,
                note: item.info || "-",
                raw: item,
            })),
        [mapClassCode, mapCourseName, queueItems]
    );

    const showDetail = (item: QueueItem) => {
        setSelectedItem(item);
        setDetailVisible(true);
    };

    const handleDelete = async (item: QueueItem) => {
        try {
            const response = await client.request(I_QUEUE_DELETE, {
                id: item.id,
            });
            if (!response.success) {
                Message.error("删除失败");
                return;
            }
            Message.success("删除成功");
            if (selectedItem?.id === item.id) {
                setDetailVisible(false);
                setSelectedItem(null);
            }
            loadQueue();
        } catch (error) {
            Message.error("删除失败");
        }
    };
    const handleToggleStatus = async (item: QueueItem) => {
        const nextStatus = item.status === "active" ? "inactive" : "active";
        try {
            const response = await client.request(I_QUEUE_STATUS, {
                id: item.id,
                status: nextStatus,
            });
            if (!response.success) {
                Message.error("请求发送失败");
                return;
            }
            Message.success("请求发送成功");
            loadQueue();
        } catch (error) {
            Message.error("请求发送失败");
        }
    };

    return (
        <Flex className="queue-page" style={{ width: "100%", height: "100%" }}>
            <div className="queue-shell">
                <div className="queue-header">
                    <div className="queue-title">任务队列</div>
                    <div className="queue-subtitle">查看当前任务进度与状态</div>
                </div>
                {isLoading && (
                    <Flex
                        style={{ height: "100%", width: "100%" }}
                        justify="center"
                        align="center"
                    >
                        <IconLoading fontSize={32} />
                    </Flex>
                )}
                {!isLoading && (
                    <Flex style={{ flex: 1, overflow: "auto" }}>
                        {listData.length === 0 ? (
                            <div className="queue-empty">
                                <div className="queue-empty-title">
                                    队列为空
                                </div>
                                <div className="queue-empty-subtitle">
                                    先去检索页面添加课程
                                </div>
                            </div>
                        ) : (
                            <List
                                className="queue-list"
                                size="large"
                                style={{ backgroundColor: "#ffffffa0" }}
                                dataSource={listData}
                                render={(item) => {
                                    const { color, icon, label } =
                                        getStatusMeta(item.status);

                                    return (
                                        <List.Item key={item.id}>
                                            <div className="queue-item">
                                                <div className="queue-main">
                                                    <div className="queue-course">
                                                        {item.courseName}
                                                    </div>
                                                    <div className="queue-meta-row">
                                                        <Tag color="orange">
                                                            班级代码：
                                                            {item.classCode}
                                                        </Tag>
                                                        <div className="queue-status">
                                                            <Tag
                                                                color={color}
                                                                icon={icon}
                                                            >
                                                                {label}
                                                            </Tag>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="queue-side">
                                                    <div className="queue-actions">
                                                        <Button
                                                            onClick={() =>
                                                                handleToggleStatus(
                                                                    item.raw
                                                                )
                                                            }
                                                            type="primary"
                                                            disabled={
                                                                item.status ===
                                                                "success"
                                                            }
                                                        >
                                                            {item.status ===
                                                            "active"
                                                                ? "停止"
                                                                : "恢复"}
                                                        </Button>
                                                        <Button
                                                            onClick={() =>
                                                                showDetail(
                                                                    item.raw
                                                                )
                                                            }
                                                        >
                                                            详情
                                                        </Button>

                                                        <Popconfirm
                                                            title="确定删除？"
                                                            position="tr"
                                                            onOk={() =>
                                                                handleDelete(
                                                                    item.raw
                                                                )
                                                            }
                                                        >
                                                            <Button status="danger">
                                                                删除
                                                            </Button>
                                                        </Popconfirm>
                                                    </div>
                                                </div>
                                            </div>
                                        </List.Item>
                                    );
                                }}
                            />
                        )}
                    </Flex>
                )}
            </div>
            <Modal
                title="课程详情"
                visible={detailVisible}
                onOk={() => setDetailVisible(false)}
                onCancel={() => setDetailVisible(false)}
                footer={null}
                okText="确定"
                cancelText="取消"
                className="course-detail-modal"
                style={{width: 640}}
                unmountOnExit
            >
                {selectedItem ? (
                    <>
                        <div className="course-detail-head">
                            <div className="course-detail-title">
                                {mapCourseName(selectedItem.data)}
                            </div>
                            <div className="course-detail-meta">
                                <span>
                                    教师：
                                    {(selectedItem.data[
                                        "任课教师"
                                    ] as string) ?? "-"}
                                </span>
                                <span>
                                    地点：
                                    {(selectedItem.data[
                                        "上课地点"
                                    ] as string) ?? "-"}
                                </span>
                                <span>
                                    周次：
                                    {(selectedItem.data["周次"] as string) ??
                                        "-"}
                                </span>
                                <span>
                                    节次：
                                    {(selectedItem.data[
                                        "上课时间"
                                    ] as string) ?? "-"}
                                </span>
                            </div>
                        </div>
                        <div className="course-detail-sections">
                            {detailGroups.map((group) => (
                                <div
                                    className="course-detail-section"
                                    key={group.title}
                                >
                                    <div className="course-detail-section-title">
                                        {group.title}
                                    </div>
                                    <Descriptions
                                        className="course-detail-desc"
                                        column={2}
                                        data={group.fields.map((field) => ({
                                            label: field.label,
                                            value:
                                                (selectedItem.data[
                                                    field.key
                                                ] as string) ?? "-",
                                        }))}
                                    />
                                </div>
                            ))}

                            <div className="course-detail-section">
                                <TaskLog taskID={selectedItem.id} />
                            </div>
                        </div>
                    </>
                ) : null}
            </Modal>
        </Flex>
    );
}

export default QueuePage;
