import React from 'react';
import { Layout, Menu } from 'antd';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  BookOutlined,
  TagsOutlined,
  FolderOutlined,
  BarChartOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const location = useLocation();
  
  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">首页</Link>,
    },
    {
      key: '/bookmarks',
      icon: <BookOutlined />,
      label: <Link to="/bookmarks">书签管理</Link>,
    },
    {
      key: '/categories',
      icon: <FolderOutlined />,
      label: <Link to="/categories">分类管理</Link>,
    },
    {
      key: '/tags',
      icon: <TagsOutlined />,
      label: <Link to="/tags">标签管理</Link>,
    },
    {
      key: '/stats',
      icon: <BarChartOutlined />,
      label: <Link to="/stats">数据统计</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ padding: 0, background: '#fff' }}>
        <div style={{ padding: '0 24px' }}>
          <h1>书签管理系统</h1>
        </div>
      </Header>
      <Layout>
        <Sider width={200} theme="light">
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            style={{ height: '100%' }}
          />
        </Sider>
        <Content style={{ padding: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 