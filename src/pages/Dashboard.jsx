import React from 'react';
import { Card, Row, Col, Statistic, List, Tag, Table } from 'antd';
import { 
  LinkOutlined, 
  GlobalOutlined, 
  TagsOutlined, 
  FolderOutlined 
} from '@ant-design/icons';
import useSWR from 'swr';
import { bookmarkAPI } from '../services/api';

const Dashboard = () => {
  const { data: stats, error } = useSWR('/stats', bookmarkAPI.getStats);

  if (error) return <div>加载失败</div>;
  if (!stats) return <div>加载中...</div>;

  return (
    <div>
      <Row gutter={[16, 16]}>
        {/* 统计卡片 */}
        <Col span={6}>
          <Card>
            <Statistic
              title="总书签数"
              value={stats.bookmarks}
              prefix={<LinkOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="域名数"
              value={stats.domains}
              prefix={<GlobalOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="标签数"
              value={stats.tags}
              prefix={<TagsOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="分类数"
              value={stats.categories}
              prefix={<FolderOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* 热门域名 */}
        <Col span={12}>
          <Card title="热门域名">
            <Table
              dataSource={stats.topDomains}
              pagination={false}
              columns={[
                {
                  title: '域名',
                  dataIndex: 'domain',
                  key: 'domain',
                },
                {
                  title: '书签数',
                  dataIndex: 'count',
                  key: 'count',
                },
              ]}
            />
          </Card>
        </Col>

        {/* 热门标签 */}
        <Col span={12}>
          <Card title="热门标签">
            <div style={{ padding: '8px' }}>
              {stats.topTags.map(({ tag, count }) => (
                <Tag key={tag} style={{ margin: '4px' }}>
                  {tag} ({count})
                </Tag>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 最近更新 */}
      <Row style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="最近更新的书签">
            <List
              dataSource={stats.recentBookmarks}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={item.title}
                    description={
                      <>
                        <Tag>{item.domain}</Tag>
                        {item.tags?.map(tag => (
                          <Tag key={tag} color="blue">{tag}</Tag>
                        ))}
                      </>
                    }
                  />
                  <div>{new Date(item.updatedAt).toLocaleString()}</div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 