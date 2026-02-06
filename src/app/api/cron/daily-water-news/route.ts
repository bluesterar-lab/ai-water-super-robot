import { NextRequest, NextResponse } from "next/server";

// Vercel Cron Job - 每天北京时间上午10点执行
// Cron表达式: 0 2 * * * (UTC时间02:00 = 北京时间10:00)
export async function GET(request: NextRequest) {
  // 验证 cron 密钥（防止未授权访问）
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // 如果配置了 CRON_SECRET 则验证，否则跳过验证（用于测试）
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Starting daily water news job at:', new Date().toISOString());

    // 获取当前请求的 URL 基础部分
    const baseUrl = request.nextUrl.origin;

    // 1. 调用搜索API获取水务新闻
    const searchResponse = await fetch(`${baseUrl}/api/search-water-news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!searchResponse.ok) {
      throw new Error(`Search API failed with status ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();

    console.log('Search response:', JSON.stringify(searchData, null, 2));

    if (!searchData.success || !searchData.results || searchData.results.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No news found or search failed",
        searchData,
        details: searchData.debug || searchData.stack
      }, { status: 500 });
    }

    console.log(`Found ${searchData.results.length} news items`);

    // 2. 调用邮件发送API发送邮件
    const emailResponse = await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newsData: searchData }),
    });

    if (!emailResponse.ok) {
      throw new Error(`Email API failed with status ${emailResponse.status}`);
    }

    const emailData = await emailResponse.json();

    if (!emailData.success) {
      return NextResponse.json({
        success: false,
        error: "Email sending failed",
        emailData
      }, { status: 500 });
    }

    console.log('Email sent successfully:', emailData.messageId);

    return NextResponse.json({
      success: true,
      message: 'Daily water news sent successfully',
      newsCount: searchData.results.length,
      emailMessageId: emailData.messageId,
      executedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      executedAt: new Date().toISOString()
    }, { status: 500 });
  }
}

// 允许 POST 方法用于手动触发测试
export async function POST(request: NextRequest) {
  // 手动测试不需要验证密钥，方便在 Web 界面测试
  // 定时任务（GET 方法）会验证 CRON_SECRET
  return GET(request);
}
