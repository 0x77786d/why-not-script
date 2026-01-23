import {
    Button,
    Input,
    Message,
    Modal,
    Notification,
    Table,
    Descriptions,
} from "@arco-design/web-react";
import { IconLoading, IconSearch } from "@arco-design/web-react/icon";
import { Flex } from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import client from "../http/client";
import { I_QUEUE_ADD, I_SEARCH_COURSE } from "../http/interface";
import { useSearchStore } from "../store/search";
import { useNavigate } from "react-router-dom";

type CourseItem = {
    序号?: string;
    课程?: string;
    开设校区?: string;
    学分?: string;
    类别?: string;
    承担单位?: string;
    上课班号?: string;
    上课班级名称?: string;
    限选人数?: string;
    已选or免听?: string;
    可选人数?: string;
    周次?: string;
    授课方式?: string;
    任课教师?: string;
    课程代码?: string;
    上课时间?: string;
    上课地点?: string;
    状态?: string;
    购买教材?: string;
    操作?: string;
    校区代码?: string;
};

const useColumns = () =>
    useMemo(
        () => [
            { title: "序号", dataIndex: "序号" },
            { title: "课程代码", dataIndex: "课程代码" },
            {
                title: "课程名称",
                dataIndex: "课程",
                render: (value: string) => {
                    if (typeof value !== "string") {
                        return value;
                    }
                    const idx = value.indexOf("]");
                    return idx >= 0 ? value.slice(idx + 1) : value;
                },
            },
            { title: "教师", dataIndex: "任课教师" },
            {
                title: "地点",
                dataIndex: "上课地点",
                render: (value: string) => {
                    if (typeof value !== "string") {
                        return value;
                    }
                    const idx = value.indexOf("(");
                    return idx >= 0 ? value.slice(0, idx) : value;
                },
            },
            { title: "周次", dataIndex: "周次" },
            { title: "时间", dataIndex: "上课时间" },
            { title: "学分", dataIndex: "学分" },
        ],
        []
    );

const detailGroups: {
    title: string;
    fields: { label: string; key: keyof CourseItem }[];
}[] = [
    {
        title: "基础信息",
        fields: [
            { label: "课程学分", key: "学分" },
            { label: "承担单位", key: "承担单位" },
            { label: "限选人数", key: "限选人数" },
            { label: "可选人数", key: "可选人数" },
            { label: "课程代码", key: "课程代码" },
            { label: "班级代码", key: "上课班号" },
            { label: "课程类别", key: "类别" },
        ],
    },
];

function SearchPage() {
    const columns = useColumns();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const {
        keyword,
        dataSource,
        hasSearched,
        setKeyword,
        setDataSource,
        setHasSearched,
    } = useSearchStore();
    const tableWrapRef = useRef<HTMLDivElement | null>(null);
    const [detailVisible, setDetailVisible] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(
        null
    );
    const [isLoading, setIsLoading] = useState(true);

    const scrollTableTop = useCallback(() => {
        const wrap = tableWrapRef.current;
        const body = wrap?.querySelector(
            ".arco-table-body"
        ) as HTMLDivElement | null;
        if (body) {
            body.scrollTo({ top: 0 });
        }
    }, []);

    const handleShowDetail = (record: CourseItem) => {
        setSelectedCourse(record);
        setDetailVisible(true);
    };

    const handleQueueAdd = async () => {
        try {
            await client.request(I_QUEUE_ADD, {
                data: selectedCourse,
            });
            Message.success("已加入队列");
            setDetailVisible(false);
            navigate("/queue");
        } catch (error) {
            Notification.error({
                title: "加入队列失败",
                content: "请检查网络或稍后重试",
            });
        }
    };

    useEffect(() => {
        const timerId = window.setTimeout(() => {
            setIsLoading(false);
        }, 250);
        return () => {
            window.clearTimeout(timerId);
        };
    }, []);

    const runSearch = async () => {
        const value = keyword.trim();
        if (!value) {
            Message.warning({
                content: "请输入检索关键字",
            });
            return;
        }

        setHasSearched(true);

        setLoading(true);

        client
            .request<CourseItem[]>(I_SEARCH_COURSE, {
                keyword: value,
            })
            .then((response) => {
                if (response.success) {
                    scrollTableTop();
                    setDataSource(response.data);
                    requestAnimationFrame(scrollTableTop);
                    Message.success(`检索到 ${response.data.length} 条结果`);
                } else {
                    Notification.error({
                        title: "检索失败",
                        content: "请检查网络或稍后重试",
                    });
                }
                setLoading(false);
            });
    };

    useEffect(() => {
        if (!loading) {
            requestAnimationFrame(scrollTableTop);
        }
    }, [loading, dataSource, scrollTableTop]);

    return (
        <Flex style={{ height: "100%", width: "100%" }}>
            <div className="search-shell">
                <Flex
                    style={{ marginBottom: 16 }}
                    justify="space-between"
                    gap="middle"
                    align="flex-end"
                >
                    <div className="search-header">
                        <div className="search-title">课程检索</div>
                        <div className="search-subtitle">
                            输入关键字即可检索课程与班级信息
                        </div>
                    </div>

                    <Flex align="flex-end" gap={0}>
                        <Input
                            className="search-input"
                            placeholder="输入关键字"
                            allowClear
                            value={keyword}
                            onChange={setKeyword}
                            onPressEnter={runSearch}
                            style={{
                                border: "solid 1px #ccc",
                                height: 32,
                                width: 480,
                            }}
                        />
                        <Button
                            className="search-btn"
                            icon={<IconSearch />}
                            type="primary"
                            loading={loading}
                            onClick={runSearch}
                        >
                            检索
                        </Button>
                    </Flex>
                </Flex>

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
                    <div className="search-table-wrap" ref={tableWrapRef}>
                        {!hasSearched ? (
                            <div className="search-empty">
                                <div className="search-empty-title">
                                    还没有进行搜索
                                </div>
                                <div className="search-empty-subtitle">
                                    输入关键字并点击搜索开始检索
                                </div>
                            </div>
                        ) : dataSource.length === 0 && !loading ? (
                            <div className="search-empty">
                                <div className="search-empty-title">
                                    没有找到课程
                                </div>
                                <div className="search-empty-subtitle">
                                    换个关键字或调整条件再试试
                                </div>
                            </div>
                        ) : (
                            <Table
                                className="search-table"
                                borderCell
                                // stripe
                                columns={[
                                    ...columns,
                                    {
                                        title: "操作",
                                        dataIndex: "operation",
                                        render: (_, record) => (
                                            <Button
                                                onClick={() =>
                                                    handleShowDetail(
                                                        record as CourseItem
                                                    )
                                                }
                                            >
                                                添加课程
                                            </Button>
                                        ),
                                    },
                                ]}
                                data={dataSource}
                                loading={loading}
                                pagination={false}
                                rowKey="__key"
                                scroll={{ y: "calc(100vh - 272px)" }}
                                // tableLayoutFixed={false}
                                // size="small"
                            />
                        )}
                    </div>
                )}
            </div>
            <Modal
                title="信息确认"
                visible={detailVisible}
                okText="确认"
                cancelText="取消"
                onOk={handleQueueAdd}
                onCancel={() => setDetailVisible(false)}
                className="course-detail-modal"
            >
                <div className="course-detail-head">
                    <div className="course-detail-title">
                        {selectedCourse?.课程 ?? "-"}
                    </div>
                    <div className="course-detail-meta">
                        <span>教师：{selectedCourse?.任课教师 ?? "-"}</span>
                        <span>地点：{selectedCourse?.上课地点 ?? "-"}</span>
                        <span>周次：{selectedCourse?.周次 ?? "-"}</span>
                        <span>节次：{selectedCourse?.上课时间 ?? "-"}</span>
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
                                    value: selectedCourse?.[field.key] ?? "-",
                                }))}
                            />
                        </div>
                    ))}
                </div>
            </Modal>
        </Flex>
    );
}

export default SearchPage;
