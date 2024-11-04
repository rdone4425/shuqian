// 定义错误类型
class ApiError extends Error {
    constructor(message, status = 500) {
      super(message);
      this.status = status;
    }
  }
  
  // CORS 头
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };
  
  // 主处理函数
  export default {
    async fetch(request, env) {
      // 检查是否有KV绑定
      if (!env.BOOKMARKS_KV) {
        return new Response(JSON.stringify({ 
          error: "KV binding not configured" 
        }), {
          status: 500,
          headers: corsHeaders
        });
      }
  
      // 处理CORS
      if (request.method === "OPTIONS") {
        return handleCORS();
      }
  
      const url = new URL(request.url);
  
      try {
        // API路由处理
        switch (url.pathname) {
          case "/ping":
            return jsonResponse({ status: "ok" });
          case "/api/save":
            return await handleSaveBookmark(request, env);
          case "/api/bookmarks":
            return await handleGetBookmarks(request, env);
          case "/api/categories/list":
            return await handleGetCategories(request, env);
          case "/api/categories/save":
            return await handleSaveCategory(request, env);
          case "/api/update":  // 添加新的路由
            return await handleUpdateBookmark(request, env);
          case "/api/domain/categories":
            return await handleGetDomainCategories(request, env);
          case "/api/domain/tags":
            return await handleGetDomainTags(request, env);
          case "/api/delete":
            return await handleDeleteBookmark(request, env);
          case "/api/stats":
            return await handleGetStats(request, env);
          case "/api/search":
            return await handleSearch(request, env);
          default:
            // 检查是否是更新书签的请求
            if (url.pathname.startsWith('/api/update/')) {
              const key = url.pathname.replace('/api/update/', '');
              return await handleUpdateBookmark(request, env, key);
            }
            return jsonResponse({ error: "Not Found" }, 404);
        }
      } catch (error) {
        console.error('Worker error:', error);
        return jsonResponse({ 
          error: error.message || "Internal Server Error" 
        }, 500);
      }
    }
  };
  
  // 辅助函数：生成JSON响应
  function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
      status,
      headers: corsHeaders
    });
  }
  
  // 辅助函数：生成错误响应
  function errorResponse(message, status = 500) {
    return jsonResponse({ error: message }, status);
  }
  
  // 处理CORS预检请求
  function handleCORS() {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  
  // 处理保存书签请求
  async function handleSaveBookmark(request, env) {
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }
  
    const data = await request.json();
    
    try {
      // 从URL中提取域名和路径
      const urlObj = new URL(data.url);
      const domain = urlObj.hostname;
      const path = urlObj.pathname + urlObj.search;
  
      // 使用域名作为key
      const domainKey = `domain:${domain}`;
      
      // 获取该域名下的所有书签
      let domainBookmarks = await env.BOOKMARKS_KV.get(domainKey);
      domainBookmarks = domainBookmarks ? JSON.parse(domainBookmarks) : [];
      
      // 检查是否已存在相同路径的书签
      const existingIndex = domainBookmarks.findIndex(b => b.path === path);
      
      // 处理标签 - 获取所有标签
      const allTagsKey = 'tags';
      let allTags = await env.BOOKMARKS_KV.get(allTagsKey);
      allTags = allTags ? JSON.parse(allTags) : [];
  
      // 确保传入的标签是数组
      const tags = Array.isArray(data.tags) ? data.tags : [];
      
      // 将新标签添加到全局标签列表（如果不存在）
      let tagsChanged = false;
      tags.forEach(tag => {
        if (tag && !allTags.includes(tag)) {
          allTags.push(tag);
          tagsChanged = true;
        }
      });
  
      // 只有当标签列表发生变化时才保存
      if (tagsChanged) {
        await env.BOOKMARKS_KV.put(allTagsKey, JSON.stringify(allTags));
      }
  
      if (existingIndex !== -1) {
        // 更新现有书签
        domainBookmarks[existingIndex] = {
          ...domainBookmarks[existingIndex],
          title: data.title,
          image: data.image,
          tags: tags,  // 直接使用处理后的标签数组
          description: data.description,
          parentCategory: data.parentCategory,
          subCategory: data.subCategory,
          updatedAt: new Date().toISOString()
        };
      } else {
        // 添加新书签
        domainBookmarks.push({
          title: data.title,
          path: path,
          image: data.image,
          tags: tags,  // 直接使用处理后的标签数组
          description: data.description,
          parentCategory: data.parentCategory,
          subCategory: data.subCategory,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
  
      // 保存更新后的书签列表
      await env.BOOKMARKS_KV.put(domainKey, JSON.stringify(domainBookmarks));
  
      // 如果有分类信息，保存分类
      if (data.parentCategory) {
        await saveNewCategory(env, data.parentCategory, data.subCategory);
      }
  
      return jsonResponse({ 
        success: true, 
        domain: domain,
        path: path,
        message: existingIndex !== -1 ? "书签更新成功" : "书签保存成功"
      });
    } catch (error) {
      console.error('Save error:', error);
      return jsonResponse({ 
        error: "保存失败：" + error.message 
      }, 500);
    }
  }
  
  // 保存新分类
  async function saveNewCategory(env, parentCategory, subCategory = null) {
    try {
      const categoryKey = `category:${parentCategory}`;
      
      // 获取父分类信息
      let categoryData = await env.BOOKMARKS_KV.get(categoryKey);
      let category = categoryData ? JSON.parse(categoryData) : {
        name: parentCategory,
        subcategories: [],
        createdAt: new Date().toISOString()
      };
      
      // 添加子分类（如果有且不重复）
      if (subCategory && !category.subcategories.find(s => s.name === subCategory)) {
        category.subcategories.push({ 
          name: subCategory,
          createdAt: new Date().toISOString()
        });
      }
      
      // 保存分类
      await env.BOOKMARKS_KV.put(categoryKey, JSON.stringify(category));
      return category;
    } catch (error) {
      console.error('Save category error:', error);
      throw error;
    }
  }
  
  // 处理保存分类请求
  async function handleSaveCategory(request, env) {
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }
  
    try {
    const { parentCategory, subCategory } = await request.json();
    if (!parentCategory) {
        throw new Error("父分类名称为必填项");
    }
  
      const categories = await saveNewCategory(env, parentCategory, subCategory);
      
      return new Response(JSON.stringify({ 
      success: true, 
      categories,
        message: "分类保存成功"
      }), {
        headers: corsHeaders
      });
    } catch (error) {
      return new Response(JSON.stringify({ 
        error: "保存分类失败：" + error.message 
      }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }
  
  // 获取书签列表
  async function handleGetBookmarks(request, env) {
    if (request.method !== "GET") {
      return new Response("Method Not Allowed", { status: 405 });
    }
  
    try {
      const url = new URL(request.url);
      const requestedDomain = url.searchParams.get('domain');
  
      // 列出所有域名
      const list = await env.BOOKMARKS_KV.list({ prefix: "domain:" });
      const result = {};
  
      for (const item of list.keys) {
        const domain = item.name.replace('domain:', '');
        // 如果指定了域名且不匹配，跳过
        if (requestedDomain && domain !== requestedDomain) {
          continue;
        }
  
        const bookmarks = await env.BOOKMARKS_KV.get(item.name);
        if (bookmarks) {
          result[domain] = JSON.parse(bookmarks);
        }
      }
  
      return jsonResponse(requestedDomain ? (result[requestedDomain] || []) : result);
    } catch (error) {
      return jsonResponse({ 
        error: "获取书签失败：" + error.message 
      }, 500);
    }
  }
  
  // 获取分类列表
  async function handleGetCategories(request, env) {
    try {
      // 列出所有分类
      const list = await env.BOOKMARKS_KV.list({ prefix: "category:" });
      const categories = [];
      
      for (const item of list.keys) {
        const categoryData = await env.BOOKMARKS_KV.get(item.name);
        if (categoryData) {
          categories.push(JSON.parse(categoryData));
        }
      }
      
      return jsonResponse(categories);
    } catch (error) {
      console.error('Get categories error:', error);
      return jsonResponse([]);
    }
  }
  
  // 修改更新书的处理函数
  async function handleUpdateBookmark(request, env) {
    if (request.method !== "POST") {
      return jsonResponse({ error: "Method Not Allowed" }, 405);
    }
  
    try {
      const data = await request.json();
      const { key } = data;  // 从请求体中获取key
      
      if (!key) {
        return jsonResponse({ error: "书签key不能为空" }, 400);
      }
  
      // 检查书签是否存在
      const existingBookmark = await env.BOOKMARKS_KV.get(key);
      if (!existingBookmark) {
        return jsonResponse({ error: "书签不存在" }, 404);
      }
  
      // 更新书签数据
      await env.BOOKMARKS_KV.put(key, JSON.stringify({
        ...JSON.parse(existingBookmark),
        title: data.title,
        image: data.image,
        tags: data.tags,
        description: data.description,
        parentCategory: data.parentCategory,
        subCategory: data.subCategory,
        updatedAt: new Date().toISOString()
      }));
  
      // 如果有分类信息，单独保存
      if (data.parentCategory) {
        await saveNewCategory(env, data.parentCategory, data.subCategory);
      }
  
      return jsonResponse({ 
        success: true, 
        key,
        message: "书签更新成功" 
      });
    } catch (error) {
      console.error('Update error:', error);
      return jsonResponse({ 
        error: "更新失败：" + error.message 
      }, 500);
    }
  }
  
  // 修改获取域名分类的处理函数
  async function handleGetDomainCategories(request, env) {
    if (request.method !== "GET") {
      return new Response("Method Not Allowed", { status: 405 });
    }
  
    try {
      const url = new URL(request.url);
      const domain = url.searchParams.get('domain');
      
      // 如果指定了域名，则获取该域名下的分类
      if (domain) {
        const domainKey = `domain:${domain}`;
        const bookmarksData = await env.BOOKMARKS_KV.get(domainKey);
        
        if (!bookmarksData) {
          return jsonResponse([]); 
        }
  
        const bookmarks = JSON.parse(bookmarksData);
        if (!Array.isArray(bookmarks)) {
          console.warn('Bookmarks data is not an array:', bookmarks);
          return jsonResponse([]); 
        }
  
        // 使用Map来收集分类信息
        const categoryMap = new Map();
  
        bookmarks.forEach(bookmark => {
          if (bookmark.parentCategory) {
            if (!categoryMap.has(bookmark.parentCategory)) {
              categoryMap.set(bookmark.parentCategory, new Set());
            }
            if (bookmark.subCategory) {
              categoryMap.get(bookmark.parentCategory).add(bookmark.subCategory);
            }
          }
        });
  
        // 转换为数组格式
        const categories = Array.from(categoryMap.entries()).map(([parentCategory, subCategories]) => ({
          name: parentCategory,
          subcategories: Array.from(subCategories).map(name => ({ name }))
        }));
  
        return jsonResponse(categories);
      } else {
        // 如果没有指定域名，获取所有分类
        const categoryList = await env.BOOKMARKS_KV.list({ prefix: "category:" });
        const categories = [];
        
        for (const item of categoryList.keys) {
          const categoryData = await env.BOOKMARKS_KV.get(item.name);
          if (categoryData) {
            categories.push(JSON.parse(categoryData));
          }
        }
        
        return jsonResponse(categories);
      }
    } catch (error) {
      console.error('Get categories error:', error);
      return jsonResponse([]); 
    }
  }
  
  // 修改获取标签的处理函数
  async function handleGetDomainTags(request, env) {
    if (request.method !== "GET") {
      return new Response("Method Not Allowed", { status: 405 });
    }
  
    try {
      const url = new URL(request.url);
      const domain = url.searchParams.get('domain');
      
      // 获取所有标签
      const allTagsKey = 'tags';
      let allTags = await env.BOOKMARKS_KV.get(allTagsKey);
      
      // 如果指定了域名，则只返回该域名下的标签
      if (domain) {
        const domainKey = `domain:${domain}`;
        const bookmarksData = await env.BOOKMARKS_KV.get(domainKey);
        
        if (!bookmarksData) {
          return jsonResponse([]); 
        }
  
        const bookmarks = JSON.parse(bookmarksData);
        
        // 收集所有标签并统计使用次数
        const tagStats = {};
        bookmarks.forEach(bookmark => {
          if (bookmark.tags && Array.isArray(bookmark.tags)) {
            bookmark.tags.forEach(tag => {
              tagStats[tag] = (tagStats[tag] || 0) + 1;
            });
          }
        });
  
        // 转换为数组格式并排序
        const tags = Object.entries(tagStats)
          .map(([tag, count]) => ({
            tag,
            count
          }))
          .filter(tag => tag.tag && tag.tag.trim())  // 过滤掉空标签
          .sort((a, b) => b.count - a.count);
  
        return jsonResponse(tags);
      } else {
        // 返回所有标签
        allTags = allTags ? JSON.parse(allTags) : [];
        
        // 转换为所需的格式
        const tags = allTags.map(tag => ({
          tag,
          count: 1  // 由于我们没有统计总数，暂时都设为1
        }));
  
        return jsonResponse(tags);
      }
    } catch (error) {
      console.error('Get tags error:', error);
      return jsonResponse([]);
    }
  }
  
  // 添加删除书签的处理函数
  async function handleDeleteBookmark(request, env) {
    if (request.method !== "POST") {
      return jsonResponse({ error: "Method Not Allowed" }, 405);
    }
  
    try {
      const { domain, path } = await request.json();
      if (!domain || !path) {
        return jsonResponse({ error: "域名和路径参数必填" }, 400);
      }
  
      // 获取域名下的书签
      const domainKey = `domain:${domain}`;
      let domainBookmarks = await env.BOOKMARKS_KV.get(domainKey);
      if (!domainBookmarks) {
        return jsonResponse({ error: "书签不存在" }, 404);
      }
  
      domainBookmarks = JSON.parse(domainBookmarks);
      const bookmarkIndex = domainBookmarks.findIndex(b => b.path === path);
      if (bookmarkIndex === -1) {
        return jsonResponse({ error: "书签不存在" }, 404);
      }
  
      // 获取要删除的书签
      const bookmark = domainBookmarks[bookmarkIndex];
  
      // 修改标签处理逻辑 - 不要删除全局标签列表中的标签
      // 只需要从书签中移除标签引用
      // const allTagsKey = 'tags';
      // let allTags = await env.BOOKMARKS_KV.get(allTagsKey);
      // if (allTags) {
      //   allTags = JSON.parse(allTags);
      //   if (bookmark.tags) {
      //     bookmark.tags.forEach(tag => {
      //       if (allTags.includes(tag)) {
      //         allTags = allTags.filter(t => t !== tag);
      //       }
      //     });
      //   }
      //   await env.BOOKMARKS_KV.put(allTagsKey, JSON.stringify(allTags));
      // }
  
      // 从书签列表中删除
      domainBookmarks.splice(bookmarkIndex, 1);
  
      // 如果域名下没有书签了，删除整个域名记录
      if (domainBookmarks.length === 0) {
        await env.BOOKMARKS_KV.delete(domainKey);
      } else {
        await env.BOOKMARKS_KV.put(domainKey, JSON.stringify(domainBookmarks));
      }
  
      return jsonResponse({ 
        success: true, 
        message: "书签删除成功" 
      });
    } catch (error) {
      console.error('Delete error:', error);
      return jsonResponse({ 
        error: "删除失败：" + error.message 
      }, 500);
    }
  }
  
  // 添加统计信息的处理函数
  async function handleGetStats(request, env) {
    try {
      const stats = {
        domains: 0,
        bookmarks: 0,
        tags: 0,
        categories: 0,
        topDomains: [],
        topTags: [],
        recentBookmarks: []
      };
  
      // 获取所有域名和书签数量
      const domainList = await env.BOOKMARKS_KV.list({ prefix: "domain:" });
      const domainStats = [];
      
      for (const item of domainList.keys) {
        const domain = item.name.replace('domain:', '');
        const bookmarks = await env.BOOKMARKS_KV.get(item.name);
        if (bookmarks) {
          const bookmarkList = JSON.parse(bookmarks);
          stats.bookmarks += bookmarkList.length;
          domainStats.push({
            domain,
            count: bookmarkList.length,
            lastUpdated: Math.max(...bookmarkList.map(b => new Date(b.updatedAt).getTime()))
          });
  
          // 收集最近的书签
          bookmarkList.forEach(bookmark => {
            stats.recentBookmarks.push({
              domain,
              ...bookmark
            });
          });
        }
      }
  
      stats.domains = domainStats.length;
  
      // 获取标签统计
      const allTags = await env.BOOKMARKS_KV.get('tags');
      if (allTags) {
        const tagsList = JSON.parse(allTags);
        stats.tags = tagsList.length;
        
        // 统计每个标签的使用次数
        const tagCounts = {};
        for (const item of domainList.keys) {
          const bookmarks = await env.BOOKMARKS_KV.get(item.name);
          if (bookmarks) {
            JSON.parse(bookmarks).forEach(bookmark => {
              if (bookmark.tags) {
                bookmark.tags.forEach(tag => {
                  tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
              }
            });
          }
        }
  
        // 生成 topTags
        stats.topTags = Object.entries(tagCounts)
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
      }
  
      // 获取分类数量
      const categoryList = await env.BOOKMARKS_KV.list({ prefix: "category:" });
      stats.categories = categoryList.keys.length;
  
      // 处理top domains
      stats.topDomains = domainStats
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
  
      // 处理最近的书签
      stats.recentBookmarks = stats.recentBookmarks
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 10);
  
      return jsonResponse(stats);
    } catch (error) {
      console.error('Stats error:', error);
      return jsonResponse({ 
        error: "获取统计信息失败：" + error.message 
      }, 500);
    }
  }
  
  // 添加搜索处理函数
  async function handleSearch(request, env) {
    if (request.method !== "GET") {
      return jsonResponse({ error: "Method Not Allowed" }, 405);
    }
  
    try {
      const url = new URL(request.url);
      const query = url.searchParams.get('q')?.toLowerCase() || '';
      const domain = url.searchParams.get('domain');
      const tag = url.searchParams.get('tag');
      const category = url.searchParams.get('category');
  
      if (!query && !tag && !category) {
        return jsonResponse({ error: "请提供搜索条件" }, 400);
      }
  
      // 获取所有域名的书签
      const list = await env.BOOKMARKS_KV.list({ prefix: "domain:" });
      const results = [];
  
      for (const item of list.keys) {
        const currentDomain = item.name.replace('domain:', '');
        
        // 如果指定了域名且不匹配，跳过
        if (domain && currentDomain !== domain) {
          continue;
        }
  
        const bookmarks = await env.BOOKMARKS_KV.get(item.name);
        if (bookmarks) {
          const domainBookmarks = JSON.parse(bookmarks);
          
          // 过滤符合条件的书签
          const filteredBookmarks = domainBookmarks.filter(bookmark => {
            // 标签匹配
            if (tag && (!bookmark.tags || !bookmark.tags.includes(tag))) {
              return false;
            }
  
            // 分类匹配
            if (category && bookmark.parentCategory !== category) {
              return false;
            }
  
            // 关键词搜索
            if (query) {
              const searchableText = [
                bookmark.title,
                bookmark.description,
                ...(bookmark.tags || []),
                bookmark.parentCategory,
                bookmark.subCategory
              ].filter(Boolean).join(' ').toLowerCase();
  
              return searchableText.includes(query);
            }
  
            return true;
          });
  
          // 添加域名信息并收集结果
          filteredBookmarks.forEach(bookmark => {
            results.push({
              ...bookmark,
              domain: currentDomain
            });
          });
        }
      }
  
      // 按更新时间排序
      results.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  
      return jsonResponse({
        total: results.length,
        results: results
      });
  
    } catch (error) {
      console.error('Search error:', error);
      return jsonResponse({ 
        error: "搜索失败：" + error.message 
      }, 500);
    }
  }
  