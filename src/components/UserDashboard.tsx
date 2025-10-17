import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { User, QueueItem, API_URLS } from '@/lib/types';

interface UserDashboardProps {
  user: User;
  queue: QueueItem[];
  currentTime: number;
  onLogout: () => void;
  onQueueUpdate: () => void;
}

const UserDashboard = ({ user, queue, currentTime, onLogout, onQueueUpdate }: UserDashboardProps) => {
  const [selectedGpu, setSelectedGpu] = useState('GPU-001');
  const [duration, setDuration] = useState('30');

  const handleJoinQueue = async (e: React.FormEvent) => {
    e.preventDefault();

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
        onQueueUpdate();
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
          <Button variant="outline" size="sm" onClick={onLogout}>
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

export default UserDashboard;
