import React from 'react';
import { Card, Row, Col } from 'antd';
import { Line, Pie } from '@ant-design/plots';
import useSWR from 'swr';
import { bookmarkAPI } from '../services/api';

const Statistics = () => {
  const { data: stats } = useSWR('/stats', bookmarkAPI.getStats);

  // 域名分布图配置
  const domainConfig = {
    data: stats?.topDomains || [],
    angleField: 'count',
    colorField: 'domain',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [{ type: 'element-active' }],
  };

  // 标签使用趋势配置
  const tagConfig = {
    data: stats?.topTags || [],
    xField: 'tag',
    yField: 'count',
    point: {
      size: 5,
      shape: 'diamond',
    },
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="域名分布">
            <Pie {...domainConfig} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="热门标签使用情况">
            <Line {...tagConfig} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="书签增长趋势">
            <Line
              data={stats?.recentBookmarks.map(bookmark => ({
                date: new Date(bookmark.createdAt).toLocaleDateString(),
                count: 1,
              })) || []}
              xField="date"
              yField="count"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Statistics; 