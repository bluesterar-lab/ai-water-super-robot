import { NextResponse } from "next/server";

export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    console.log('=== Search Water News API Started ===');

    const allKeywords = [
      "水务系统自动投加", "曝气系统优化", "二次供水技术", "水务节能",
      "水务故障诊断", "水务大模型", "水处理自动化", "污水处理技术",
      "water treatment automation", "smart water management",
      "wastewater innovation", "water distribution AI"
    ];

    // 打乱并随机抽取 6 个词（增加数量以保证新闻充足）
    const shuffled = allKeywords.sort(() => 0.5 - Math.random());
    const keywordsToSearch = shuffled.slice(0, 6); 

    const allResults: any[] = [];
    
    // 🗑️ 黑名单：垃圾词与不相关站点
    const spamKeywords = ["彩金", "博彩", "牛牛", "百家乐", "微信充值", "娱乐城", "棋牌", "春晚", "央视", "明星", "饭圈", "游戏"];
    const spamSites = ["3dm", "游侠", "gamersky", "网易大神", "thepaper.cn"]; 

    // 💧 白名单（核心防御）：新闻中必须包含以下至少一个水务根词汇，否则视为搜索引擎过度联想的跨界新闻
    const mustHaveWaterWords = ["水", "环保", "治污", "管网", "泵", "净水", "排污", "water", "wastewater", "pump", "pipe", "aeration", "utilities", "aquatic"];

    const searchPromises = keywordsToSearch.map(async (keyword) => {
      try {
        // 🚨 核心逻辑 1：判断是中文还是英文
        const isEnglish = !/[\u4e00-\u9fa5]/.test(keyword);
        let rssUrl = '';

        if (isEnglish) {
          // 英文关键词 -> 切换到国际/美国节点，获取纯正海外资讯
          rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(keyword + ' when:7d')}&hl=en-US&gl=US&ceid=US:en`;
        } else {
          // 中文关键词 -> 保持中国节点
          rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(keyword + ' when:7d')}&hl=zh-CN&gl=CN&ceid=CN:zh-Hans`;
        }
        
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
          
          // 1. 过滤垃圾黑名单
          const hasSpamWord = spamKeywords.some(spam => textToCheck.includes(spam.toLowerCase()));
          const isSpamSite = spamSites.some(site => item.siteName.toLowerCase().includes(site.toLowerCase()));
          
          // 🚨 核心逻辑 2：强校验是否真的和“水”相关！
          const hasWaterContext = mustHaveWaterWords.some(waterWord => textToCheck.includes(waterWord));
          
          // 只有：没有垃圾词 + 不是垃圾网站 + 确实包含水务字眼，才会被保留
          return !hasSpamWord && !isSpamSite && hasWaterContext;
        }).slice(0, 5);
        
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
