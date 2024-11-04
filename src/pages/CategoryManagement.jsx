import React, { useState } from 'react';
import { Card, Button, Table, Modal, Form, Input, message, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import useSWR from 'swr';
import { bookmarkAPI } from '../services/api';

const CategoryManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { data: categories, mutate } = useSWR('/categories', bookmarkAPI.getCategories);

  const columns = [
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '子分类',
      dataIndex: 'subcategories',
      key: 'subcategories',
      render: (subcategories) => (
        <Space wrap>
          {subcategories?.map(sub => (
            <span key={sub.name}>{sub.name}</span>
          ))}
        </Space>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString(),
    },
  ];

  const handleAdd = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await bookmarkAPI.saveCategory(values);
      message.success('保存成功');
      setIsModalVisible(false);
      mutate();
    } catch (error) {
      message.error('保存失败');
    }
  };

  return (
    <Card
      title="分类管理"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加分类
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={categories}
        rowKey="name"
      />

      <Modal
        title="添加分类"
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="parentCategory"
            label="父分类名称"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="subCategory"
            label="子分类名称"
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default CategoryManagement; 