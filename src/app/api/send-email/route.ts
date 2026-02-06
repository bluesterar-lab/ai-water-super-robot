import { NextRequest, NextResponse } from "next/server";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { newsData } = await request.json();

    if (!newsData || !newsData.results || newsData.results.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No news data provided"
      }, { status: 400 });
    }

    // 格式化新闻内容为 HTML
    const newsHTML = newsData.results
      .map((item: any, index: number) => `
        <div style="margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #e5e7eb;">
          <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 18px;">
            ${index + 1}. ${item.title}
          </h3>
          <div style="margin-bottom: 8px;">
            <span style="display: inline-block; background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-right: 8px;">
              ${item.siteName || '未知来源'}
            </span>
            ${item.publishTime ? `<span style="color: #6b7280; font-size: 12px;">${new Date(item.publishTime).toLocaleString('zh-CN')}</span>` : ''}
          </div>
          <p style="margin: 8px 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
            ${item.snippet}
          </p>
          <div style="margin-top: 8px;">
            <a href="${item.url}" style="color: #2563eb; text-decoration: none; font-size: 14px;">
              阅读全文 →
            </a>
          </div>
        </div>
      `)
      .join('');

    const emailHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; margin-bottom: 30px; color: white; }
            .header h1 { margin: 0; font-size: 28px; }
            .header p { margin: 8px 0 0 0; opacity: 0.9; }
            .summary { background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
            .summary h2 { margin: 0 0 12px 0; font-size: 20px; color: #1f2937; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌊 水务行业每日资讯</h1>
              <p>AI水务机器人自动推送 | ${new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
            </div>

            <div class="summary">
              <h2>📊 今日概览</h2>
              <p>共检索到 <strong>${newsData.results.length}</strong> 条水务行业最新资讯，涵盖自动投加、曝气系统、二次供水、分组节能、故障诊断、水务系统大模型等领域。</p>
            </div>

            <div class="content">
              <h2 style="margin-bottom: 20px;">📰 最新资讯</h2>
              ${newsHTML}
            </div>

            <div class="footer">
              <p>本邮件由AI水务机器人自动生成，如有问题请联系管理员</p>
              <p>转发设置：自动转发至 bihui.jin@outlook.com</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // 发送邮件到第一个邮箱（会自动转发到第二个邮箱）
    const { data, error } = await resend.emails.send({
      from: 'AI Water Robot <onboarding@resend.dev>',
      to: ['bluesterar@gmail.com'],
      subject: `🌊 水务每日资讯 - ${new Date().toLocaleDateString('zh-CN')}`,
      html: emailHTML,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id,
      sentAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Send email error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
