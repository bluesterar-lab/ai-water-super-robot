import { NextResponse } from "next/server";
import { SearchClient, Config } from "coze-coding-dev-sdk";

// 强制提升 Vercel 最大执行时间，防止 10 秒超时
export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    console.log('=== Search Water News API Started ===');

    const customHeaders = {
      'Authorization': `Bearer ${process.env.COZE_API_KEY}`
    };
    const config = new Config();
    const client = new SearchClient(config, customHeaders);

    const allKeywords = [
      "水务系统自动投加", "曝气系统优化", "二次供水技术", "水务分组节能",
      "水务故障诊断", "水务系统大模型", "水处理自动化", "污水处理技术",
      "water treatment automation", "smart water management"
    ];

    const shuffled = allKeywords.sort(() => 0.5 - Math.random());
    const keywordsToSearch = shuffled.slice(0, 4); 

    // 🚨 修复点：明确告诉 TypeScript 这是一个可以装任意类型数据的数组
    const allResults: any[] = [];
    
    const searchPromises = keywordsToSearch.map(async (keyword) => {
      try {
        const response = await client.webSearch(keyword, 4, true);
        if (response.web_items && response.web_items.length > 0) {
          return response.web_items.map((item: any) => ({
            title: item.title,
            url: item.url,
            snippet: item.snippet,
            siteName: item.site_name,
            publishTime: item.publish_time,
            keyword: keyword
          }));
        }
      } catch (e) {
        console.error(`Error with ${keyword}:`, e);
      }
      return [];
    });

    const resultsArrays = await Promise.all(searchPromises);
    resultsArrays.forEach(res => allResults.push(...res));

    const uniqueResults = Array.from(new Map(allResults.map(item => [item.url, item])).values());
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
