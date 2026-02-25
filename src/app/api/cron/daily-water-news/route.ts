import { NextRequest, NextResponse } from "next/server";

// 🚨 核心修复 1：定时任务总入口也必须提升为 60 秒，否则会被强杀
export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Starting daily water news job at:', new Date().toISOString());

    // 🚨 核心修复 2：在 Vercel 环境下，更准确地获取本机域名，防止内部 fetch 失败
    const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL 
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` 
      : request.nextUrl.origin;

    // 1. 调用搜索API
    const searchResponse = await fetch(`${baseUrl}/api/search-water-news`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (!searchResponse.ok) throw new Error(`Search API failed: ${searchResponse.status}`);
    const searchData = await searchResponse.json();

    // 🚨 核心修复 3：如果今天行业太安静，没抓到新闻，不报错崩溃，而是正常记录日志跳过
    if (!searchData.success || !searchData.results || searchData.results.length === 0) {
      console.log("今天没有匹配到足够的高质量水务新闻，跳过邮件发送。");
      return NextResponse.json({ 
        success: true, 
        message: "No relevant news found today, skipped email." 
      });
    }

    // 2. 调用邮件发送API
    const emailResponse = await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newsData: searchData }),
      cache: 'no-store'
    });

    if (!emailResponse.ok) throw new Error(`Email API failed: ${emailResponse.status}`);
    const emailData = await emailResponse.json();

    if (!emailData.success) throw new Error("Email sending failed");

    return NextResponse.json({
      success: true,
      message: 'Daily water news sent successfully',
      newsCount: searchData.results.length,
      executedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
