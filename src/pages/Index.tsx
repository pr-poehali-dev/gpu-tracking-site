import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

const API_URLS = {
  auth: 'https://functions.poehali.dev/fcb44185-d66a-4870-87b1-2bfa277fc778',
  queue: 'https://functions.poehali.dev/dbf44a9d-cbd1-4898-9632-5025ff48b329',
  admin: 'https://functions.poehali.dev/63a27393-625b-45d9-8528-151eadbebdc2'
};

interface User {
  id: number;
  username: string;
  role: 'user' | 'admin';
}

interface QueueItem {
  id: number;
  user_id: number;
  username: string;
  gpu_name: string;
  duration_minutes: number;
  start_time: string | null;
  end_time: string | null;
  status: string;
  position: number;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [selectedGpu, setSelectedGpu] = useState('GPU-001');
  const [duration, setDuration] = useState('30');
  const [adminData, setAdminData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchQueue = async () => {
    try {
      const response = await fetch(API_URLS.queue);
      const data = await response.json();
      setQueue(data.queue || []);
    } catch (error) {
      console.error('Error fetching queue:', error);
    }
  };

  const fetchAdminData = async () => {
    if (user?.role !== 'admin') return;
    
    try {
      const response = await fetch(API_URLS.admin, {
        headers: {
          'X-User-Role': 'admin'
        }
      });
      const data = await response.json();
      setAdminData(data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchQueue();
      const interval = setInterval(fetchQueue, 5000);
      
      if (user.role === 'admin') {
        fetchAdminData();
        const adminInterval = setInterval(fetchAdminData, 10000);
        return () => {
          clearInterval(interval);
          clearInterval(adminInterval);
        };
      }
      
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(API_URLS.auth, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isLogin ? 'login' : 'register',
          username,
          password,
          role: isLogin ? undefined : role
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
        toast.success(isLogin ? 'Вход выполнен!' : 'Регистрация успешна!');
      } else {
        toast.error(data.error || 'Ошибка авторизации');
      }
    } catch (error) {
      toast.error('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const response = await fetch(API_URLS.queue, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          username: user.username,
          gpu_name: selectedGpu,
          duration_minutes: parseInt(duration)
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`Вы в очереди! Позиция: ${data.position}`);
        fetchQueue();
      } else {
        toast.error('Ошибка записи в очередь');
      }
    } catch (error) {
      toast.error('Ошибка соединения');
    }
  };

  const calculateTimeRemaining = (endTime: string | null) => {
    if (!endTime) return null;
    
    const end = new Date(endTime).getTime();
    const now = Date.now();
    const remaining = Math.max(0, end - now);
    
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/10 p-4">
        <Card className="w-full max-w-md glass-card">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-primary/20">
                <Icon name="Cpu" className="h-7 w-7 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">GPU Queue System</CardTitle>
                <CardDescription className="text-xs">Система управления очередью GPU</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={isLogin ? 'login' : 'register'} onValueChange={(v) => setIsLogin(v === 'login')}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Вход</TabsTrigger>
                <TabsTrigger value="register">Регистрация</TabsTrigger>
              </TabsList>

              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Имя пользователя</Label>
                  <Input
                    id="username"
                    placeholder="Введите имя"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Введите пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {!isLogin && (
                  <div className="space-y-3">
                    <Label>Роль</Label>
                    <RadioGroup value={role} onValueChange={(v) => setRole(v as 'user' | 'admin')}>
                      <div className="flex items-center space-x-2 p-3 rounded-lg border border-border/50 bg-background/50">
                        <RadioGroupItem value="user" id="user" />
                        <Label htmlFor="user" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Icon name="User" className="h-4 w-4 text-primary" />
                            <div>
                              <p className="font-medium">Пользователь</p>
                              <p className="text-xs text-muted-foreground">Доступ к очереди GPU</p>
                            </div>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 rounded-lg border border-border/50 bg-background/50">
                        <RadioGroupItem value="admin" id="admin" />
                        <Label htmlFor="admin" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Icon name="Shield" className="h-4 w-4 text-secondary" />
                            <div>
                              <p className="font-medium">Администратор</p>
                              <p className="text-xs text-muted-foreground">Управление системой и базой данных</p>
                            </div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                      Загрузка...
                    </>
                  ) : (
                    <>
                      <Icon name={isLogin ? 'LogIn' : 'UserPlus'} className="mr-2 h-4 w-4" />
                      {isLogin ? 'Войти' : 'Зарегистрироваться'}
                    </>
                  )}
                </Button>
              </form>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.role === 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
        <div className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/20">
                <Icon name="Shield" className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Панель администратора</h1>
                <p className="text-xs text-muted-foreground">{user.username}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setUser(null)}>
              <Icon name="LogOut" className="h-4 w-4 mr-2" />
              Выход
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Пользователей</CardTitle>
                <Icon name="Users" className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminData?.users?.length || 0}</div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">В очереди</CardTitle>
                <Icon name="Clock" className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminData?.queue_stats?.waiting || 0}</div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Активных</CardTitle>
                <Icon name="Activity" className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminData?.queue_stats?.active || 0}</div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Завершено</CardTitle>
                <Icon name="CheckCircle" className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminData?.queue_stats?.completed || 0}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Все пользователи</CardTitle>
              <CardDescription>Список зарегистрированных пользователей</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {adminData?.users?.map((u: any) => (
                  <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon name={u.role === 'admin' ? 'Shield' : 'User'} className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{u.username}</p>
                        <p className="text-xs text-muted-foreground">ID: {u.id}</p>
                      </div>
                    </div>
                    <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                      {u.role === 'admin' ? 'Администратор' : 'Пользователь'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>История очереди</CardTitle>
              <CardDescription>Все записи в очереди</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {adminData?.all_queue?.map((item: QueueItem) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon name="Cpu" className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{item.username}</p>
                        <p className="text-xs text-muted-foreground">{item.gpu_name} • {item.duration_minutes} мин</p>
                      </div>
                    </div>
                    <Badge variant={
                      item.status === 'active' ? 'default' :
                      item.status === 'waiting' ? 'secondary' : 'outline'
                    }>
                      {item.status === 'active' ? 'Активен' :
                       item.status === 'waiting' ? 'Ожидает' : 'Завершен'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const userQueueItems = queue.filter(q => q.user_id === user.id);
  const activeSession = userQueueItems.find(q => q.status === 'active');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Icon name="Cpu" className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">GPU Queue</h1>
              <p className="text-xs text-muted-foreground">{user.username}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setUser(null)}>
            <Icon name="LogOut" className="h-4 w-4 mr-2" />
            Выход
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {activeSession && (
          <Card className="glass-card border-primary/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/20 animate-pulse-slow">
                    <Icon name="Zap" className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Активная сессия</CardTitle>
                    <CardDescription>{activeSession.gpu_name}</CardDescription>
                  </div>
                </div>
                <Badge className="text-lg px-4 py-2">Активно</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Осталось времени</p>
                  <p className="text-4xl font-bold tabular-nums">
                    {calculateTimeRemaining(activeSession.end_time) || '0:00'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Длительность</p>
                  <p className="text-xl font-semibold">{activeSession.duration_minutes} мин</p>
                </div>
              </div>
              <Progress 
                value={activeSession.end_time ? 
                  ((new Date(activeSession.end_time).getTime() - currentTime) / (activeSession.duration_minutes * 60000)) * 100 : 0
                } 
              />
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="glass-card lg:col-span-2">
            <CardHeader>
              <CardTitle>Очередь GPU</CardTitle>
              <CardDescription>Текущие запросы на использование</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {queue.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Icon name="Inbox" className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Очередь пуста</p>
                </div>
              ) : (
                queue.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      item.user_id === user.id ? 'bg-primary/5 border-primary/30' : 'bg-background/50 border-border/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary font-bold">
                        {item.position}
                      </div>
                      <div>
                        <p className="font-semibold">{item.username}</p>
                        <p className="text-sm text-muted-foreground">{item.gpu_name} • {item.duration_minutes} мин</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                        {item.status === 'active' ? 'Активен' : 'Ожидает'}
                      </Badge>
                      {item.status === 'active' && item.end_time && (
                        <p className="text-sm text-muted-foreground mt-1 tabular-nums">
                          {calculateTimeRemaining(item.end_time)}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Встать в очередь</CardTitle>
              <CardDescription>Забронировать GPU</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinQueue} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gpu">Выберите GPU</Label>
                  <Select value={selectedGpu} onValueChange={setSelectedGpu}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GPU-001">GPU-001 (RTX 4090)</SelectItem>
                      <SelectItem value="GPU-002">GPU-002 (RTX 4090)</SelectItem>
                      <SelectItem value="GPU-003">GPU-003 (RTX 4080)</SelectItem>
                      <SelectItem value="GPU-004">GPU-004 (RTX 4080)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Время использования (мин)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="5"
                    max="240"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Icon name="Plus" className="mr-2 h-4 w-4" />
                  Встать в очередь
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
