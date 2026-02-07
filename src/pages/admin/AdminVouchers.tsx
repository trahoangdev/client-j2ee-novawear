import { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Typography, Modal, Form, Input, InputNumber, DatePicker, Select, Switch, message, Spin, Tag, Dropdown } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, DeleteOutlined, MoreOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import { adminVoucherApi } from '@/services/voucherApi';
import type { VoucherDto } from '@/types/api';
import dayjs from 'dayjs';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export function AdminVouchers() {
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<VoucherDto | null>(null);
    const [form] = Form.useForm();
    const [dataSource, setDataSource] = useState<VoucherDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [searchKeyword, setSearchKeyword] = useState('');

    const fetchVouchers = async (page = 1, size = 10, keyword = '') => {
        setLoading(true);
        try {
            const { data } = await adminVoucherApi.list({ page: page - 1, size, keyword: keyword || undefined });
            setDataSource(data.content);
            setPagination({ current: page, pageSize: size, total: data.totalElements });
        } catch {
            message.error('Không tải được danh sách voucher');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVouchers();
    }, []);

    const handleSearch = (value: string) => {
        setSearchKeyword(value);
        fetchVouchers(1, pagination.pageSize, value);
    };

    const handleTableChange = (pag: any) => {
        fetchVouchers(pag.current, pag.pageSize, searchKeyword);
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();

            const payload = {
                code: values.code?.toUpperCase(),
                description: values.description,
                discountType: values.discountType,
                discountValue: values.discountValue,
                minOrderValue: values.minOrderValue || null,
                maxDiscount: values.maxDiscount || null,
                startDate: values.dateRange?.[0]?.toISOString() || null,
                endDate: values.dateRange?.[1]?.toISOString() || null,
                usageLimit: values.usageLimit || null,
                usageLimitPerUser: values.usageLimitPerUser || null,
                active: values.active ?? true,
            };

            if (editing) {
                await adminVoucherApi.update(editing.id, payload);
                message.success('Đã cập nhật voucher');
            } else {
                await adminVoucherApi.create(payload);
                message.success('Đã tạo voucher mới');
            }
            setModalOpen(false);
            setEditing(null);
            form.resetFields();
            fetchVouchers(pagination.current, pagination.pageSize, searchKeyword);
        } catch (e: unknown) {
            if (e && typeof e === 'object' && 'errorFields' in e) return;
            message.error(editing ? 'Cập nhật thất bại' : 'Tạo voucher thất bại');
        }
    };

    const handleDelete = (record: VoucherDto) => {
        Modal.confirm({
            title: 'Xóa voucher?',
            content: `Bạn có chắc muốn xóa voucher "${record.code}"?`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await adminVoucherApi.delete(record.id);
                    message.success('Đã xóa voucher');
                    fetchVouchers(pagination.current, pagination.pageSize, searchKeyword);
                } catch {
                    message.error('Xóa thất bại');
                }
            },
        });
    };

    const handleToggle = async (record: VoucherDto) => {
        try {
            await adminVoucherApi.toggle(record.id);
            message.success(record.active ? 'Đã tắt voucher' : 'Đã bật voucher');
            fetchVouchers(pagination.current, pagination.pageSize, searchKeyword);
        } catch {
            message.error('Thao tác thất bại');
        }
    };

    const openEditModal = (record: VoucherDto) => {
        setEditing(record);
        form.setFieldsValue({
            code: record.code,
            description: record.description,
            discountType: record.discountType,
            discountValue: record.discountValue,
            minOrderValue: record.minOrderValue,
            maxDiscount: record.maxDiscount,
            dateRange: record.startDate && record.endDate
                ? [dayjs(record.startDate), dayjs(record.endDate)]
                : null,
            usageLimit: record.usageLimit,
            usageLimitPerUser: record.usageLimitPerUser,
            active: record.active,
        });
        setModalOpen(true);
    };

    const columns: ColumnsType<VoucherDto> = [
        {
            title: 'Mã',
            dataIndex: 'code',
            key: 'code',
            width: 120,
            render: (code: string, record: VoucherDto) => (
                <Space direction="vertical" size={0}>
                    <Typography.Text strong copyable style={{ fontFamily: 'monospace' }}>{code}</Typography.Text>
                    {record.active ? (
                        <Tag color="green" style={{ marginTop: 4 }}>Hoạt động</Tag>
                    ) : (
                        <Tag color="default" style={{ marginTop: 4 }}>Tắt</Tag>
                    )}
                </Space>
            ),
        },
        {
            title: 'Giảm giá',
            key: 'discount',
            width: 140,
            render: (_, record: VoucherDto) => (
                <Space direction="vertical" size={0}>
                    <Typography.Text strong>
                        {record.discountType === 'PERCENT'
                            ? `${record.discountValue}%`
                            : formatCurrency(record.discountValue)}
                    </Typography.Text>
                    {record.maxDiscount && record.discountType === 'PERCENT' && (
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            Tối đa {formatCurrency(record.maxDiscount)}
                        </Typography.Text>
                    )}
                </Space>
            ),
        },
        {
            title: 'Điều kiện',
            key: 'condition',
            width: 150,
            render: (_, record: VoucherDto) => (
                <Space direction="vertical" size={0}>
                    {record.minOrderValue ? (
                        <Typography.Text style={{ fontSize: 12 }}>
                            Đơn tối thiểu: {formatCurrency(record.minOrderValue)}
                        </Typography.Text>
                    ) : (
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>Không giới hạn</Typography.Text>
                    )}
                </Space>
            ),
        },
        {
            title: 'Thời gian',
            key: 'time',
            width: 180,
            render: (_, record: VoucherDto) => {
                const start = record.startDate ? dayjs(record.startDate).format('DD/MM/YYYY') : '—';
                const end = record.endDate ? dayjs(record.endDate).format('DD/MM/YYYY') : '—';
                const isExpired = record.endDate && dayjs(record.endDate).isBefore(dayjs());
                return (
                    <Space direction="vertical" size={0}>
                        <Typography.Text style={{ fontSize: 12 }}>{start} → {end}</Typography.Text>
                        {isExpired && <Tag color="red">Hết hạn</Tag>}
                    </Space>
                );
            },
        },
        {
            title: 'Đã dùng',
            key: 'usage',
            width: 100,
            align: 'center',
            render: (_, record: VoucherDto) => (
                <Typography.Text>
                    {record.usedCount || 0} / {record.usageLimit || '∞'}
                </Typography.Text>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 80,
            align: 'center',
            render: (_, record) => (
                <Dropdown
                    menu={{
                        items: [
                            {
                                key: 'edit',
                                label: 'Sửa',
                                icon: <EditOutlined />,
                                onClick: () => openEditModal(record),
                            },
                            {
                                key: 'toggle',
                                label: record.active ? 'Tắt voucher' : 'Bật voucher',
                                icon: record.active ? <StopOutlined /> : <CheckCircleOutlined />,
                                onClick: () => handleToggle(record),
                            },
                            { type: 'divider' },
                            {
                                key: 'delete',
                                label: 'Xóa',
                                icon: <DeleteOutlined />,
                                danger: true,
                                onClick: () => handleDelete(record),
                            },
                        ],
                    }}
                    trigger={['click']}
                >
                    <Button type="text" icon={<MoreOutlined style={{ fontSize: 18 }} />} />
                </Dropdown>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <Typography.Title level={4} style={{ margin: 0, color: 'var(--admin-text)' }}>
                    Quản lý Voucher
                </Typography.Title>
                <Space>
                    <Input.Search
                        placeholder="Tìm mã voucher..."
                        allowClear
                        onSearch={handleSearch}
                        style={{ width: 220 }}
                    />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => { setEditing(null); form.resetFields(); form.setFieldsValue({ discountType: 'PERCENT', active: true }); setModalOpen(true); }}
                    >
                        Tạo voucher
                    </Button>
                </Space>
            </div>

            <Card>
                <Spin spinning={loading}>
                    <Table
                        dataSource={dataSource}
                        columns={columns}
                        rowKey="id"
                        pagination={{
                            ...pagination,
                            showSizeChanger: true,
                            showTotal: (t) => `Tổng ${t} voucher`,
                        }}
                        onChange={handleTableChange}
                        size="middle"
                        scroll={{ x: 900 }}
                        tableLayout="fixed"
                    />
                </Spin>
            </Card>

            <Modal
                title={editing ? 'Sửa voucher' : 'Tạo voucher mới'}
                open={modalOpen}
                onOk={handleSave}
                onCancel={() => { setModalOpen(false); setEditing(null); form.resetFields(); }}
                okText="Lưu"
                cancelText="Hủy"
                destroyOnClose
                width={600}
            >
                <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                    <Form.Item
                        name="code"
                        label="Mã voucher"
                        rules={[
                            { required: true, message: 'Nhập mã voucher' },
                            { min: 3, message: 'Tối thiểu 3 ký tự' },
                            { max: 20, message: 'Tối đa 20 ký tự' },
                        ]}
                        extra="Mã sẽ tự động viết hoa"
                    >
                        <Input
                            placeholder="VD: WELCOME10"
                            style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
                            disabled={!!editing}
                        />
                    </Form.Item>

                    <Form.Item name="description" label="Mô tả">
                        <Input placeholder="VD: Giảm 10% cho đơn hàng đầu tiên" maxLength={200} />
                    </Form.Item>

                    <Space style={{ width: '100%' }} styles={{ item: { flex: 1 } }}>
                        <Form.Item
                            name="discountType"
                            label="Loại giảm"
                            rules={[{ required: true, message: 'Chọn loại giảm' }]}
                            style={{ flex: 1 }}
                        >
                            <Select
                                options={[
                                    { value: 'PERCENT', label: 'Phần trăm (%)' },
                                    { value: 'FIXED', label: 'Số tiền cố định (VNĐ)' },
                                ]}
                            />
                        </Form.Item>
                        <Form.Item
                            name="discountValue"
                            label="Giá trị giảm"
                            rules={[{ required: true, message: 'Nhập giá trị' }]}
                            style={{ flex: 1 }}
                        >
                            <InputNumber
                                min={0}
                                max={form.getFieldValue('discountType') === 'PERCENT' ? 100 : 100000000}
                                style={{ width: '100%' }}
                                placeholder="VD: 10"
                                formatter={(value) => form.getFieldValue('discountType') === 'FIXED'
                                    ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                    : `${value}`
                                }
                            />
                        </Form.Item>
                    </Space>

                    <Space style={{ width: '100%' }} styles={{ item: { flex: 1 } }}>
                        <Form.Item name="minOrderValue" label="Đơn tối thiểu" style={{ flex: 1 }}>
                            <InputNumber
                                min={0}
                                style={{ width: '100%' }}
                                placeholder="0 = không giới hạn"
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value?.replace(/,/g, '') as any}
                            />
                        </Form.Item>
                        <Form.Item name="maxDiscount" label="Giảm tối đa" style={{ flex: 1 }}>
                            <InputNumber
                                min={0}
                                style={{ width: '100%' }}
                                placeholder="Chỉ áp dụng cho %"
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value?.replace(/,/g, '') as any}
                            />
                        </Form.Item>
                    </Space>

                    <Form.Item name="dateRange" label="Thời gian hiệu lực">
                        <DatePicker.RangePicker
                            style={{ width: '100%' }}
                            format="DD/MM/YYYY"
                            placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                        />
                    </Form.Item>

                    <Space style={{ width: '100%' }} styles={{ item: { flex: 1 } }}>
                        <Form.Item name="usageLimit" label="Giới hạn lượt dùng" style={{ flex: 1 }}>
                            <InputNumber min={0} style={{ width: '100%' }} placeholder="0 = không giới hạn" />
                        </Form.Item>
                        <Form.Item name="usageLimitPerUser" label="Giới hạn/người dùng" style={{ flex: 1 }}>
                            <InputNumber min={0} style={{ width: '100%' }} placeholder="0 = không giới hạn" />
                        </Form.Item>
                    </Space>

                    <Form.Item name="active" label="Trạng thái" valuePropName="checked">
                        <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
