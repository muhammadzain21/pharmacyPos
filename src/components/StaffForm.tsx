
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Save } from 'lucide-react';

interface StaffFormProps {
  isUrdu: boolean;
  onClose: () => void;
  onSave: (staff: any) => void;
  staff?: any;
}

const StaffForm: React.FC<StaffFormProps> = ({ isUrdu, onClose, onSave, staff }) => {
  const [formData, setFormData] = useState({
    name: staff?.name || '',
    position: staff?.position || '',
    phone: staff?.phone || '',
    email: staff?.email || '',
    address: staff?.address || '',
    salary: staff?.salary || '',
    joinDate: staff?.joinDate || new Date().toISOString().split('T')[0],
    status: staff?.status || 'active'
  });

  const text = {
    en: {
      title: staff ? 'Edit Staff' : 'Add Staff',
      name: 'Staff Name',
      position: 'Position',
      phone: 'Phone Number',
      email: 'Email',
      address: 'Address',
      salary: 'Salary',
      joinDate: 'Join Date',
      status: 'Status',
      active: 'Active',
      inactive: 'Inactive',
      pharmacist: 'Pharmacist',
      assistant: 'Assistant',
      cashier: 'Cashier',
      manager: 'Manager',
      save: 'Save',
      cancel: 'Cancel'
    },
    ur: {
      title: staff ? 'عملے میں تبدیلی' : 'عملہ شامل کریں',
      name: 'عملے کا نام',
      position: 'عہدہ',
      phone: 'فون نمبر',
      email: 'ای میل',
      address: 'پتہ',
      salary: 'تنخواہ',
      joinDate: 'شمولیت کی تاریخ',
      status: 'حالت',
      active: 'فعال',
      inactive: 'غیر فعال',
      pharmacist: 'فارماسسٹ',
      assistant: 'اسسٹنٹ',
      cashier: 'کیشیئر',
      manager: 'منیجر',
      save: 'محفوظ کریں',
      cancel: 'منسوخ'
    }
  };

  const t = isUrdu ? text.ur : text.en;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: staff?.id || Date.now(),
      attendanceRecords: staff?.attendanceRecords || []
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t.title}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>{t.name}</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label>{t.position}</Label>
              <Select value={formData.position} onValueChange={(value) => setFormData({...formData, position: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pharmacist">{t.pharmacist}</SelectItem>
                  <SelectItem value="assistant">{t.assistant}</SelectItem>
                  <SelectItem value="cashier">{t.cashier}</SelectItem>
                  <SelectItem value="manager">{t.manager}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t.phone}</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
              />
            </div>

            <div>
              <Label>{t.email}</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div>
              <Label>{t.address}</Label>
              <Textarea
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>

            <div>
              <Label>{t.salary}</Label>
              <Input
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({...formData, salary: e.target.value})}
              />
            </div>

            <div>
              <Label>{t.joinDate}</Label>
              <Input
                type="date"
                value={formData.joinDate}
                onChange={(e) => setFormData({...formData, joinDate: e.target.value})}
              />
            </div>

            <div>
              <Label>{t.status}</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t.active}</SelectItem>
                  <SelectItem value="inactive">{t.inactive}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-2">
              <Button type="submit" className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {t.save}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                {t.cancel}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffForm;
