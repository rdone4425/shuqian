import React, { useState } from 'react';
import { Card, Input, Tag, Space, Row, Col } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import useSWR from 'swr';
import { bookmarkAPI } from '../services/api';

const TagManagement = () => {
  const [searchText, setSearchText] = useState('');
  const { data: domainTags } = useSWR('/domain/tags', bookmarkAPI.getDomainTags);

  const filteredTags = domainTags?.filter(tag => 
    tag.tag.toLowerCase().includes(searchText.toLowerCase())
  ) || [];

  return (
    <Card title="标签管理">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Input
          placeholder="搜索标签"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        <Row gutter={[8, 8]}>
          {filteredTags.map(({ tag, count }) => (
            <Col key={tag}>
              <Tag 
                color="blue"
                style={{ 
                  padding: '4px 8px',
                  fontSize: '14px',
                  margin: '4px'
                }}
              >
                {tag} ({count})
              </Tag>
            </Col>
          ))}
        </Row>
      </Space>
    </Card>
  );
};

export default TagManagement; 