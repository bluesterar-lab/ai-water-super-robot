'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Mail, Search, Clock, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function WaterNewsRobotPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearchAndSend = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/cron/daily-water-news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'test-secret'}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        const errorDetails = data.details ? JSON.stringify(data.details, null, 2) : '';
        setError(`${data.error || '操作失败'}\n\n详细信息:\n${errorDetails}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误');
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/test-resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          type: 'email-test',
          ...data,
        });
      } else {
        const errorDetails = data.details ? JSON.stringify(data.details, null, 2) : '';
        setError(`${data.error || '操作失败'}\n\n详细信息:\n${errorDetails}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchOnly = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/search-water-news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          type: 'search-only',
          ...data,
        });
      } else {
        setError(data.error || '搜索失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误');
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/test-resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          type: 'email-test',
          ...data,
        });
      } else {
        const errorDetails = data.details ? JSON.stringify(data.details, null, 2) : '';
        setError(`${data.error || '操作失败'}\n\n详细信息:\n${errorDetails}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 头部 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              AI 水务机器人
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            每天自动搜索水务行业最新资讯并发送到邮箱
          </p>
        </div>

        {/* 主要操作区 */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-600" />
                手动搜索测试
              </CardTitle>
              <CardDescription>
                测试水务新闻搜索功能，不发送邮件
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleSearchOnly}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    搜索中...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    开始搜索
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-green-600" />
                手动执行完整流程
              </CardTitle>
              <CardDescription>
                搜索并发送邮件到配置的邮箱
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleSearchAndSend}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    执行中...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    执行并发送邮件
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-orange-200 dark:border-orange-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-orange-600" />
                测试邮件发送
              </CardTitle>
              <CardDescription>
                仅测试 Resend API 是否正常工作
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleTestEmail}
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    发送测试中...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    发送测试邮件
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 结果展示区 */}
        {result && (
          <Card className="border-2 border-green-200 dark:border-green-800 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-6 h-6" />
                执行成功
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {result.newsCount || result.count || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    新闻数量
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="text-lg font-semibold text-blue-600">
                    {result.emailMessageId ? '已发送' : '仅搜索'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    邮件状态
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <div className="text-lg font-semibold text-purple-600">
                    {result.executedAt || new Date().toLocaleTimeString('zh-CN')}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    执行时间
                  </div>
                </div>
              </div>

              {result.type === 'email-test' ? (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold text-lg mb-4">邮件测试结果</h3>
                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                      <p className="text-sm mb-2">✅ 测试邮件发送成功！</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Message ID: {result.messageId}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        请检查 bluesterar@gmail.com 邮箱
                      </p>
                    </div>
                  </div>
                </>
              ) : result.results && result.results.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold text-lg mb-4">搜索结果预览</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {result.results.slice(0, 5).map((item: any, index: number) => (
                        <div
                          key={index}
                          className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-sm flex-1">{item.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {item.siteName}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                            {item.snippet}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              阅读全文
                            </a>
                            {item.publishTime && (
                              <>
                                <span>•</span>
                                <span>{new Date(item.publishTime).toLocaleDateString('zh-CN')}</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* 错误展示 */}
        {error && (
          <Card className="border-2 border-red-200 dark:border-red-800 mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-3 text-red-600">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5" />
                  <div className="font-semibold">执行失败</div>
                </div>
                <div className="text-sm text-red-500 whitespace-pre-wrap font-mono bg-red-50 dark:bg-red-950 p-4 rounded-lg overflow-auto max-h-96">
                  {error}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 配置信息卡片 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              定时任务配置
            </CardTitle>
            <CardDescription>
              每天北京时间上午10:00自动执行
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  发送邮箱
                </div>
                <div className="text-sm bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                  bluesterar@gmail.com
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  自动转发到
                </div>
                <div className="text-sm bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                  bihui.jin@outlook.com
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  搜索范围
                </div>
                <div className="text-sm bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                  全流程和自动投加、曝气系统、二次供水、分组节能、故障诊断、水务系统大模型
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
