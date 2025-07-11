import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Pill } from 'lucide-react';
import { ensureDefaultAdmin, authenticateUser } from '@/utils/userStorage';
import { useAuditLog } from '@/contexts/AuditLogContext';

interface LoginFormProps {
  onLogin: (user: any) => void;
  isUrdu: boolean;
  setIsUrdu: (value: boolean) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, isUrdu, setIsUrdu }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { logAction } = useAuditLog();

  const t = {
    en: {
      title: 'Pharmacy Management System',
      subtitle: 'Sign in to your account',
      email: 'Email',
      password: 'Password',
      login: 'Sign In',
      invalid: 'Invalid email or password',
    },
    ur: {
      title: 'فارمیسی منیجمنٹ سسٹم',
      subtitle: 'اپنے اکاؤنٹ میں لاگ ان کریں',
      email: 'ای میل',
      password: 'پاس ورڈ',
      login: 'لاگ ان',
      invalid: 'غلط ای میل یا پاس ورڈ',
    },
  }[isUrdu ? 'ur' : 'en'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // make sure default admin exists
    ensureDefaultAdmin();

    const user = authenticateUser(email, password);
    if (user) {
      onLogin(user);
      logAction('LOGIN', isUrdu ? `${user.name} نے لاگ ان کیا` : `${user.name} logged in`, 'user', user.id);
    } else {
      alert(t.invalid);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Pill className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">{t.title}</CardTitle>
          <p className="text-gray-600">{t.subtitle}</p>
          <div className="flex justify-center mt-4">
            <Button
              variant={isUrdu ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsUrdu(true)}
              className="mr-2"
            >
              اردو
            </Button>
            <Button
              variant={!isUrdu ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsUrdu(false)}
            >
              English
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t.email}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t.password}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              {loading ? (isUrdu ? 'لاج ان ہو رہا ہے…' : 'Signing in…') : t.login}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
