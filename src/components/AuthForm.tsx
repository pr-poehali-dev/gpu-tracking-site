import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { User, API_URLS } from '@/lib/types';

interface AuthFormProps {
  onAuthSuccess: (user: User) => void;
}

const AuthForm = ({ onAuthSuccess }: AuthFormProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [loading, setLoading] = useState(false);

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
        onAuthSuccess(data.user);
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
};

export default AuthForm;
