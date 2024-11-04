import React, { useState } from 'react';
import { Table, Card, Button, Input, Space, Modal, Form, message } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import useSWR from 'swr';
import { bookmarkAPI } from '../services/api';

const BookmarkList = () => {
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  
  const { data: bookmarks, mutate } = useSWR('/bookmarks', () => 
    bookmarkAPI.getBookmarks()
  );

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '域名',
      dataIndex: 'domain',
      key: 'domain',
    },
    {
      title: '分类',
      dataIndex: 'parentCategory',
      key: 'category',
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags) => tags?.join(', '),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (record) => {
    try {
      await bookmarkAPI.deleteBookmark({
        domain: record.domain,
        path: record.path,
      });
      message.success('删除成功');
      mutate();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await bookmarkAPI.saveBookmark(values);
      message.success('保存成功');
      setIsModalVisible(false);
      mutate();
    } catch (error) {
      message.error('保存失败');
    }
  };

  return (
    <Card
      title="书签管理"
      extra={
        <Space>
          <Input
            placeholder="搜索书签"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加书签
          </Button>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={bookmarks}
        rowKey={(record) => `${record.domain}${record.path}`}
      />

      <Modal
        title="书签信息"
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="url"
            label="URL"
            rules={[{ required: true, type: 'url' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea />
          </Form.Item>
          {/* 其他表单项... */}
        </Form>
      </Modal>
    </Card>
  );
};

export default BookmarkList; 