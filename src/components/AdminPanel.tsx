import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { User, QueueItem } from '@/lib/types';

interface AdminPanelProps {
  user: User;
  adminData: any;
  onLogout: () => void;
}

const AdminPanel = ({ user, adminData, onLogout }: AdminPanelProps) => {
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
          <Button variant="outline" size="sm" onClick={onLogout}>
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
};

export default AdminPanel;
