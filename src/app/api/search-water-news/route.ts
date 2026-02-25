import { NextResponse } from "next/server";

export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // 🚨 核心修复 4：补充一些大范围的行业热门词，搭配冷门词一起搜，保证每天都有内容
    const allKeywords = [
      "智慧水务", "水务集团", "水处理技术", "水污染防治", "二次供水设备",
      "水务系统自动投加", "曝气系统优化", "水务大模型", "水处理自动化",
      "water treatment automation", "smart water management",
      "wastewater innovation", "water utility AI"
    ];

    const shuffled = allKeywords.sort(() => 0.5 - Math.random());
    const keywordsToSearch = shuffled.slice(0, 5); 

    const allResults: any[] = [];
    
    const spamKeywords = ["彩金", "博彩", "牛牛", "百家乐", "微信充值", "娱乐城", "棋牌", "春晚", "央视", "明星", "饭圈", "游戏"];
    const spamSites = ["3dm", "游侠", "gamersky", "网易大神", "thepaper.cn"]; 
    const mustHaveWaterWords = ["水", "环保", "治污", "管网", "泵", "净水", "排污", "water", "wastewater", "pump", "pipe", "aeration", "utilities", "aquatic"];

    const searchPromises = keywordsToSearch.map(async (keyword) => {
      try {
        const isEnglish = !/[\u4e00-\u9fa5]/.test(keyword);
        
        // 🚨 核心修复 5：将搜索时间范围从 7天(when:7d) 放宽到 14天(when:14d)，保证内容充足
        const rssUrl = isEnglish 
          ? `https://news.google.com/rss/search?q=${encodeURIComponent(keyword + ' when:14d')}&hl=en-US&gl=US&ceid=US:en` 
          : `https://news.google.com/rss/search?q=${encodeURIComponent(keyword + ' when:14d')}&hl=zh-CN&gl=CN&ceid=CN:zh-Hans`;
        
        const response = await fetch(rssUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
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
          const siteName = sourceMatch ? sourceMatch[1] : (isEnglish ? 'Industry News' : '行业资讯');
          
          return {
            title: cleanTitle,
            url: linkMatch ? linkMatch[1] : '',
            snippet: cleanTitle, 
            siteName: siteName,
            publishTime: pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString(),
            keyword: keyword,
            isInternational: isEnglish
          };
        }).filter(item => {
          const textToCheck = (item.title + " " + item.siteName).toLowerCase();
          
          const hasSpamWord = spamKeywords.some(spam => textToCheck.includes(spam.toLowerCase()));
          const isSpamSite = spamSites.some(site => item.siteName.toLowerCase().includes(site.toLowerCase()));
          const hasWaterContext = mustHaveWaterWords.some(waterWord => textToCheck.includes(waterWord));
          
          return !hasSpamWord && !isSpamSite && hasWaterContext;
        }).slice(0, 5);
        
        return parsedItems;
      } catch (e) {
        return [];
      }
    });

    const resultsArrays = await Promise.all(searchPromises);
    resultsArrays.forEach(res => allResults.push(...res));

    const uniqueResults = Array.from(new Map(allResults.map(item => [item.url, item])).values());
    uniqueResults.sort((a, b) => new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime());
    
    return NextResponse.json({
      success: true,
      count: uniqueResults.slice(0, 15).length,
      results: uniqueResults.slice(0, 15),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
