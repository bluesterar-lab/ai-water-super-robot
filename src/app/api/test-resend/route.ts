import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST() {
  try {
    console.log('=== Testing Resend API ===');

    // 检查环境变量
    const apiKey = process.env.RESEND_API_KEY;
    console.log('1. 检查 RESEND_API_KEY:');
    console.log('   - 存在:', !!apiKey);
    console.log('   - 长度:', apiKey?.length);
    console.log('   - 格式正确:', apiKey?.startsWith('re_'));

    if (!apiKey) {
      throw new Error('❌ RESEND_API_KEY 未配置！请在 Vercel 环境变量中配置。');
    }

    if (!apiKey.startsWith('re_')) {
      throw new Error('❌ RESEND_API_KEY 格式错误！应该以 "re_" 开头。');
    }

    // 初始化 Resend 客户端
    const resend = new Resend(apiKey);

    // 发送测试邮件
    console.log('2. 发送测试邮件到 bluesterar@gmail.com...');

    const { data, error } = await resend.emails.send({
      from: 'AI Water Robot Test <onboarding@resend.dev>',
      to: ['bluesterar@gmail.com'],
      subject: '🧪 Resend API 测试邮件',
      html: `
        <h1>测试成功！</h1>
        <p>这是来自 AI 水务机器人的测试邮件。</p>
        <p>如果你收到这封邮件，说明 Resend API 配置正确！✅</p>
        <p>时间: ${new Date().toLocaleString('zh-CN')}</p>
      `,
    });

    if (error) {
      console.error('❌ 发送失败:', error);
      throw new Error(`Resend API 错误: ${error.message}\n详细信息: ${JSON.stringify(error)}`);
    }

    console.log('✅ 邮件发送成功！Message ID:', data?.id);

    return NextResponse.json({
      success: true,
      message: '测试邮件发送成功！',
      messageId: data?.id,
      note: '请检查 bluesterar@gmail.com 邮箱是否收到测试邮件'
    });

  } catch (error) {
    console.error('测试失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      suggestion: '请检查 Vercel 环境变量中的 RESEND_API_KEY 是否正确配置'
    }, { status: 500 });
  }
}
