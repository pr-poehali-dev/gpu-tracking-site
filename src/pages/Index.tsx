import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const gpuData = [
  { time: '00:00', usage: 45, temp: 68, memory: 8.2 },
  { time: '04:00', usage: 78, temp: 72, memory: 12.5 },
  { time: '08:00', usage: 92, temp: 78, memory: 14.8 },
  { time: '12:00', usage: 65, temp: 70, memory: 10.3 },
  { time: '16:00', usage: 88, temp: 75, memory: 13.9 },
  { time: '20:00', usage: 55, temp: 69, memory: 9.1 },
];

const gpuList = [
  { id: 'GPU-001', name: 'RTX 4090', status: 'active', usage: 92, temp: 78, user: 'Алексей М.' },
  { id: 'GPU-002', name: 'RTX 4090', status: 'active', usage: 65, temp: 70, user: 'Мария К.' },
  { id: 'GPU-003', name: 'RTX 4080', status: 'idle', usage: 0, temp: 45, user: null },
  { id: 'GPU-004', name: 'RTX 4080', status: 'maintenance', usage: 0, temp: 38, user: null },
];

const queueList = [
  { id: 1, user: 'Дмитрий П.', priority: 'high', gpu: 'RTX 4090', estimatedTime: '15 мин', position: 1 },
  { id: 2, user: 'Елена С.', priority: 'medium', gpu: 'RTX 4080', estimatedTime: '45 мин', position: 2 },
  { id: 3, user: 'Иван Р.', priority: 'low', gpu: 'RTX 4090', estimatedTime: '2 ч', position: 3 },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) {
      setIsAuthenticated(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/10">
        <Card className="w-full max-w-md glass-card">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-primary/20">
                <Icon name="Cpu" className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">GPU Monitor</CardTitle>
            </div>
            <CardDescription>Войдите для доступа к системе мониторинга</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ваше имя</Label>
                <Input
                  id="name"
                  placeholder="Введите имя"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="bg-background/50"
                />
              </div>
              <Button type="submit" className="w-full">
                <Icon name="LogIn" className="mr-2 h-4 w-4" />
                Войти
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Icon name="Cpu" className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">GPU Monitor</h1>
          </div>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-primary/20 text-primary">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{userName}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid bg-muted/50">
            <TabsTrigger value="dashboard" className="gap-2">
              <Icon name="LayoutDashboard" className="h-4 w-4" />
              Дашборд
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="gap-2">
              <Icon name="Activity" className="h-4 w-4" />
              Мониторинг
            </TabsTrigger>
            <TabsTrigger value="queue" className="gap-2">
              <Icon name="Users" className="h-4 w-4" />
              Очередь
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <Icon name="User" className="h-4 w-4" />
              Профиль
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Активные GPU</CardTitle>
                  <Icon name="Cpu" className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2/4</div>
                  <p className="text-xs text-muted-foreground">50% загрузка системы</p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Средняя загрузка</CardTitle>
                  <Icon name="TrendingUp" className="h-4 w-4 text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">78%</div>
                  <p className="text-xs text-muted-foreground">+12% за последний час</p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">В очереди</CardTitle>
                  <Icon name="Users" className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">Среднее время: 45 мин</p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Температура</CardTitle>
                  <Icon name="Thermometer" className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">74°C</div>
                  <p className="text-xs text-muted-foreground">В пределах нормы</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Загрузка GPU</CardTitle>
                  <CardDescription>За последние 24 часа</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={gpuData}>
                      <defs>
                        <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="usage"
                        stroke="hsl(var(--primary))"
                        fillOpacity={1}
                        fill="url(#colorUsage)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Температура</CardTitle>
                  <CardDescription>Мониторинг в реальном времени</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={gpuData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="temp"
                        stroke="hsl(var(--destructive))"
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--destructive))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Статус GPU</CardTitle>
                <CardDescription>Актуальная информация о всех устройствах</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {gpuList.map((gpu) => (
                  <div
                    key={gpu.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Icon name="Cpu" className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{gpu.name}</p>
                          <Badge
                            variant={
                              gpu.status === 'active'
                                ? 'default'
                                : gpu.status === 'idle'
                                ? 'secondary'
                                : 'destructive'
                            }
                          >
                            {gpu.status === 'active'
                              ? 'Активен'
                              : gpu.status === 'idle'
                              ? 'Свободен'
                              : 'Обслуживание'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{gpu.id}</p>
                        {gpu.user && (
                          <p className="text-sm text-muted-foreground">Использует: {gpu.user}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Загрузка</p>
                          <p className="text-sm font-semibold">{gpu.usage}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Температура</p>
                          <p className="text-sm font-semibold">{gpu.temp}°C</p>
                        </div>
                      </div>
                      <Progress value={gpu.usage} className="w-32" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="queue" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="glass-card lg:col-span-2">
                <CardHeader>
                  <CardTitle>Электронная очередь</CardTitle>
                  <CardDescription>Текущие запросы на использование GPU</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {queueList.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary font-bold">
                          {item.position}
                        </div>
                        <div>
                          <p className="font-semibold">{item.user}</p>
                          <p className="text-sm text-muted-foreground">{item.gpu}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge
                          variant={
                            item.priority === 'high'
                              ? 'destructive'
                              : item.priority === 'medium'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {item.priority === 'high'
                            ? 'Высокий'
                            : item.priority === 'medium'
                            ? 'Средний'
                            : 'Низкий'}
                        </Badge>
                        <div className="text-right">
                          <Icon name="Clock" className="h-4 w-4 inline mr-1 text-muted-foreground" />
                          <span className="text-sm">{item.estimatedTime}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Записаться в очередь</CardTitle>
                  <CardDescription>Забронировать GPU</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="gpu-select">Выберите GPU</Label>
                      <select
                        id="gpu-select"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option>RTX 4090</option>
                        <option>RTX 4080</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Приоритет</Label>
                      <select
                        id="priority"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option>Низкий</option>
                        <option>Средний</option>
                        <option>Высокий</option>
                      </select>
                    </div>
                    <Button type="submit" className="w-full">
                      <Icon name="Plus" className="mr-2 h-4 w-4" />
                      Встать в очередь
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Профиль</CardTitle>
                  <CardDescription>Информация о пользователе</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                        {userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-lg">{userName}</p>
                      <p className="text-sm text-muted-foreground">ID: USER-001</p>
                    </div>
                  </div>
                  <div className="space-y-2 pt-4 border-t border-border/50">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Всего сессий</span>
                      <span className="font-semibold">24</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Время использования</span>
                      <span className="font-semibold">156 ч</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Текущий статус</span>
                      <Badge variant="secondary">Активен</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card lg:col-span-2">
                <CardHeader>
                  <CardTitle>История использования</CardTitle>
                  <CardDescription>Последние сессии</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { date: '16 окт, 14:30', gpu: 'RTX 4090', duration: '2ч 15м', status: 'completed' },
                    { date: '15 окт, 09:00', gpu: 'RTX 4080', duration: '4ч 30м', status: 'completed' },
                    { date: '14 окт, 16:45', gpu: 'RTX 4090', duration: '1ч 20м', status: 'completed' },
                  ].map((session, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50"
                    >
                      <div className="flex items-center gap-3">
                        <Icon name="Calendar" className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{session.date}</p>
                          <p className="text-sm text-muted-foreground">{session.gpu}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm">{session.duration}</span>
                        <Badge variant="outline">Завершено</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
