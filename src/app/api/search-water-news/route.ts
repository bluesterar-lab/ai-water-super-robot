import { NextResponse } from "next/server";

// 强制提升 Vercel 最大执行时间
export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    console.log('=== Search Water News API Started ===');

    const allKeywords = [
      "水务系统自动投加", "曝气系统优化", "二次供水技术", "水务分组节能",
      "水务故障诊断", "水务系统大模型", "水处理自动化", "污水处理技术",
      "water treatment automation", "smart water management"
    ];

    // 随机打乱并取 4 个关键词进行搜索，防超时
    const shuffled = allKeywords.sort(() => 0.5 - Math.random());
    const keywordsToSearch = shuffled.slice(0, 4); 

    const allResults: any[] = [];
    
    // 【核心修复】：直接使用原生 Fetch 抓取 Google News RSS，放弃受限的 Coze SDK
    const searchPromises = keywordsToSearch.map(async (keyword) => {
      try {
        // when:7d 表示只抓取最近 7 天的最新行业新闻
        const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(keyword + ' when:7d')}&hl=zh-CN&gl=CN&ceid=CN:zh-Hans`;
        
        const response = await fetch(rssUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          next: { revalidate: 0 } // 防止 Vercel 缓存旧新闻
        });

        if (!response.ok) {
           console.error(`RSS fetch failed for ${keyword}`);
           return [];
        }

        const xmlText = await response.text();
        
        // 用正则解析 XML 数据，完全不需要额外的第三方库
        const items = [...xmlText.matchAll(/<item>([\s\S]*?)<\/item>/gi)];
        
        const parsedItems = items.slice(0, 5).map(item => {
          const itemXml = item[1];
          const titleMatch = itemXml.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
          const linkMatch = itemXml.match(/<link[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
          const pubDateMatch = itemXml.match(/<pubDate[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/pubDate>/i);
          const sourceMatch = itemXml.match(/<source[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/source>/i);
          
          const cleanTitle = titleMatch ? titleMatch[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"') : '未知标题';
          
          return {
            title: cleanTitle,
            url: linkMatch ? linkMatch[1] : '',
            snippet: cleanTitle, 
            siteName: sourceMatch ? sourceMatch[1] : '行业资讯',
            publishTime: pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString(),
            keyword: keyword
          };
        });
        
        return parsedItems;
      } catch (e) {
        console.error(`Error with ${keyword}:`, e);
        return [];
      }
    });

    const resultsArrays = await Promise.all(searchPromises);
    resultsArrays.forEach(res => allResults.push(...res));

    // 根据 URL 去重
    const uniqueResults = Array.from(new Map(allResults.map(item => [item.url, item])).values());
    
    // 按发布时间从新到旧排序
    uniqueResults.sort((a, b) => new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime());
    
    const limitedResults = uniqueResults.slice(0, 20); 

    return NextResponse.json({
      success: true,
      count: limitedResults.length,
      results: limitedResults,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
