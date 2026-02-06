import { NextRequest, NextResponse } from "next/server";
import { SearchClient, Config, HeaderUtils } from "coze-coding-dev-sdk";

export async function POST(request: NextRequest) {
  try {
    console.log('=== Search Water News API Started ===');

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new SearchClient(config, customHeaders);

    console.log('SearchClient initialized');

    // 水务相关关键词
    const keywords = [
      "水务系统自动投加",
      "曝气系统优化",
      "二次供水技术",
      "水务分组节能",
      "水务故障诊断",
      "水务系统大模型",
      "water treatment automation",
      "aeration system optimization",
      "secondary water supply",
      "water energy efficiency",
      "water system fault diagnosis",
      "water management AI model"
    ];

    console.log(`Starting search with ${keywords.length} keywords`);

    const allResults = [];
    let searchErrors = [];

    // 搜索每个关键词
    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i];
      console.log(`[${i + 1}/${keywords.length}] Searching for: "${keyword}"`);

      try {
        const response = await client.webSearch(keyword, 5, true);

        console.log(`  Response for "${keyword}":`, {
          hasWebItems: !!response.web_items,
          itemCount: response.web_items?.length || 0,
          hasSummary: !!response.summary
        });

        if (response.web_items && response.web_items.length > 0) {
          const results = response.web_items.map((item) => ({
            title: item.title,
            url: item.url,
            snippet: item.snippet,
            siteName: item.site_name,
            publishTime: item.publish_time,
            keyword: keyword
          }));
          allResults.push(...results);
          console.log(`  ✓ Found ${results.length} results for "${keyword}"`);
        } else {
          console.log(`  ✗ No results for "${keyword}"`);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`✗ Error searching for "${keyword}":`, errorMsg);
        searchErrors.push({ keyword, error: errorMsg });
      }
    }

    console.log(`Search completed. Total results: ${allResults.length}, Errors: ${searchErrors.length}`);

    // 去重（基于URL）
    const uniqueResults = Array.from(
      new Map(allResults.map(item => [item.url, item])).values()
    );

    // 按发布时间排序（最新的在前）
    uniqueResults.sort((a, b) => {
      const dateA = a.publishTime ? new Date(a.publishTime).getTime() : 0;
      const dateB = b.publishTime ? new Date(b.publishTime).getTime() : 0;
      return dateB - dateA;
    });

    // 限制返回数量
    const limitedResults = uniqueResults.slice(0, 30);

    return NextResponse.json({
      success: true,
      count: limitedResults.length,
      results: limitedResults,
      searchedAt: new Date().toISOString(),
      debug: {
        totalRawResults: uniqueResults.length,
        searchErrors: searchErrors
      }
    });
  } catch (error) {
    console.error("Search water news error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;

    return NextResponse.json({
      success: false,
      error: errorMessage,
      stack: errorStack
    }, { status: 500 });
  }
}
