import { NextResponse } from "next/server";

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

    const shuffled = allKeywords.sort(() => 0.5 - Math.random());
    const keywordsToSearch = shuffled.slice(0, 4); 

    const allResults: any[] = [];
    
    // 🚨 新增：垃圾信息过滤词库和黑名单站点
    const spamKeywords = ["彩金", "博彩", "牛牛", "百家乐", "微信充值", "娱乐城", "棋牌", "澳门", "真人", "开户", "代理", "体育", "电竞", "平台"];
    const spamSites = ["3dm", "游侠", "游戏", "gamersky", "网易大神"]; // 屏蔽常被用来发垃圾贴的游戏/社区平台

    const searchPromises = keywordsToSearch.map(async (keyword) => {
      try {
        const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(keyword + ' when:7d')}&hl=zh-CN&gl=CN&ceid=CN:zh-Hans`;
        
        const response = await fetch(rssUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          next: { revalidate: 0 } 
        });

        if (!response.ok) return [];

        const xmlText = await response.text();
        const items = [...xmlText.matchAll(/<item>([\s\S]*?)<\/item>/gi)];
        
        const parsedItems = items.map(item => {
          const itemXml = item[1];
          const titleMatch = itemXml.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
          const linkMatch = itemXml.match(/<link[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
          const pubDateMatch = itemXml.match(/<pubDate[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/pubDate>/i);
          const sourceMatch = itemXml.match(/<source[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/source>/i);
          
          const cleanTitle = titleMatch ? titleMatch[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"') : '未知标题';
          const siteName = sourceMatch ? sourceMatch[1] : '行业资讯';
          
          return {
            title: cleanTitle,
            url: linkMatch ? linkMatch[1] : '',
            snippet: cleanTitle, 
            siteName: siteName,
            publishTime: pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString(),
            keyword: keyword
          };
        }).filter(item => {
          // 🚨 核心过滤逻辑：如果标题里包含违禁词，或者来源是黑名单网站，直接抛弃！
          const textToCheck = (item.title + " " + item.siteName).toLowerCase();
          const hasSpamWord = spamKeywords.some(spam => textToCheck.includes(spam.toLowerCase()));
          const isSpamSite = spamSites.some(site => item.siteName.toLowerCase().includes(site.toLowerCase()));
          
          return !hasSpamWord && !isSpamSite;
        }).slice(0, 5); // 过滤干净后，再取前5条
        
        return parsedItems;
      } catch (e) {
        console.error(`Error with ${keyword}:`, e);
        return [];
      }
    });

    const resultsArrays = await Promise.all(searchPromises);
    resultsArrays.forEach(res => allResults.push(...res));

    const uniqueResults = Array.from(new Map(allResults.map(item => [item.url, item])).values());
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
