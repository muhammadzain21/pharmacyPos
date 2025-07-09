import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Save, 
  Building, 
  User, 
  Bell, 
  Shield, 
  Printer,
  Database,
  Globe,
  Settings as SettingsIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface SettingsProps {
  isUrdu: boolean;
  setIsUrdu: (value: boolean) => void;
}

// Default settings
const defaultSettings = {
  companyName: 'PharmaCare',
  companyAddress: 'Main Boulevard, Gulshan-e-Iqbal, Karachi',
  companyPhone: '+92-21-1234567',
  companyEmail: 'info@pharmacare.com',
  taxRate: '17',
  currency: 'PKR',
  dateFormat: 'dd/mm/yyyy',
  notifications: true,
  autoBackup: true,
  printReceipts: true,
  barcodeScanning: true,
  language: 'en'
};

const Settings: React.FC<SettingsProps> = ({ isUrdu, setIsUrdu }) => {
  const { toast } = useToast();
  const { settings: contextSettings, updateSettings } = useSettings();
  const [settings, setSettings] = useState(contextSettings);
  
  // Update local state when context settings change
  useEffect(() => {
    setSettings(contextSettings);
  }, [contextSettings]);
  
  // Update parent language when settings change
  useEffect(() => {
    setIsUrdu(settings.language === 'ur');
  }, [settings.language, setIsUrdu]);

  const text = {
    en: {
      title: 'Settings',
      company: 'Company Settings',
      system: 'System Settings',
      notifications: 'Notifications',
      backup: 'Backup & Security',
      companyName: 'Company Name',
      companyAddress: 'Company Address',
      companyPhone: 'Phone Number',
      companyEmail: 'Email Address',
      taxRate: 'Tax Rate (%)',
      currency: 'Currency',
      dateFormat: 'Date Format',
      language: 'Language',
      enableNotifications: 'Enable Notifications',
      autoBackup: 'Auto Backup',
      printReceipts: 'Auto Print Receipts',
      barcodeScanning: 'Enable Barcode Scanning',
      save: 'Save Settings',
      english: 'English',
      urdu: 'اردو',
      saved: 'Settings saved successfully!',
      deleteAllData: 'Delete All Data',
      dangerZone: 'Danger Zone',
      irreversibleActions: 'These actions are irreversible. Proceed with caution.',
      deleteAllDataConfirmation: 'This will permanently delete ALL pharmacy data including medicines, staff, sales, and settings.',
      typeToDelete: 'To confirm, type:',
      cancel: 'Cancel',
      nextVerification: 'Next Verification',
      permanentlyDeleteAllData: 'Permanently Delete All Data',
      verificationFailed: 'Verification Failed',
      pleaseType: 'Please type',
      exactlyToProceed: 'exactly to proceed',
      finalConfirmation: 'Please type the final confirmation phrase exactly to delete all data',
      allDataDeleted: 'All Data Deleted',
      dataPermanentlyErased: 'All pharmacy data has been permanently erased',
    },
    ur: {
      title: 'سیٹنگز',
      company: 'کمپنی کی سیٹنگز',
      system: 'سسٹم کی سیٹنگز',
      notifications: 'اطلاعات',
      backup: 'بیک اپ اور سیکیورٹی',
      companyName: 'کمپنی کا نام',
      companyAddress: 'کمپنی کا پتہ',
      companyPhone: 'فون نمبر',
      companyEmail: 'ای میل ایڈریس',
      taxRate: 'ٹیکس کی شرح (%)',
      currency: 'کرنسی',
      dateFormat: 'تاریخ کا فارمیٹ',
      language: 'زبان',
      enableNotifications: 'اطلاعات فعال کریں',
      autoBackup: 'خودکار بیک اپ',
      printReceipts: 'خودکار رسید پرنٹ',
      barcodeScanning: 'بار کوڈ اسکیننگ فعال کریں',
      save: 'سیٹنگز محفوظ کریں',
      english: 'English',
      urdu: 'اردو',
      saved: 'سیٹنگز کامیابی سے محفوظ ہوئیں!',
      deleteAllData: 'تمام ڈیٹا حذف کریں',
      dangerZone: 'خطرے کی زون',
      irreversibleActions: 'یہ کارروائیاں غیر قابل واپسی ہیں۔ احتیاط سے آگے بڑھیں۔',
      deleteAllDataConfirmation: 'یہ تمام فارمیسی ڈیٹا کو مستقل طور پر حذف کر دے گا بشمول ادویات، عملہ، فروخت، اور سیٹنگز۔',
      typeToDelete: 'توثیق کے لیے، ٹائپ کریں:',
      cancel: 'منسوخ کریں',
      nextVerification: 'اگلی توثیق',
      permanentlyDeleteAllData: 'تمام ڈیٹا کو مستقل طور پر حذف کریں',
      verificationFailed: 'توثیق ناکام ہو گئی',
      pleaseType: 'براہ کرم ٹائپ کریں',
      exactlyToProceed: 'آگے بڑھنے کے لیے بالکل',
      finalConfirmation: 'براہ کرم تمام ڈیٹا کو حذف کرنے کے لیے حتمی توثیقی جملہ بالکل ٹائپ کریں',
      allDataDeleted: 'تمام ڈیٹا حذف ہو گیا',
      dataPermanentlyErased: 'تمام فارمیسی ڈیٹا کو مستقل طور پر حذف کر دیا گیا ہے',
    }
  };

  const t = isUrdu ? text.ur : text.en;

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [verificationStep, setVerificationStep] = useState(1);
  const [confirmText, setConfirmText] = useState('');
  
  const verificationPhrases = [
    'DELETE ALL DATA',
    'CONFIRM DELETION',
    'PERMANENTLY ERASE'
  ];

  const handleDeleteAllData = () => {
    if (confirmText === verificationPhrases[verificationStep - 1]) {
      if (verificationStep < 3) {
        setVerificationStep(verificationStep + 1);
        setConfirmText('');
      } else {
        // Final confirmation - delete all data
        if (confirmText === verificationPhrases[2]) {
          // Preserve protected medicines
          const protectedMeds = localStorage.getItem('protectedMedicines');
          
          // Clear all localStorage data
          localStorage.clear();
          
          // Restore protected medicines
          if (protectedMeds) {
            localStorage.setItem('protectedMedicines', protectedMeds);
          }
          
          // Show success message
          toast({
            title: t.allDataDeleted,
            description: t.dataPermanentlyErased + ' (protected medicines preserved)',
            variant: 'default'
          });
          
          // Reset and close dialog
          setVerificationStep(1);
          setConfirmText('');
          setShowDeleteDialog(false);
        }
      }
    } else {
      toast({
        title: t.verificationFailed,
        description: t.pleaseType + ' "' + verificationPhrases[verificationStep - 1] + '" ' + t.exactlyToProceed,
        variant: 'destructive'
      });
    }
  };

  const handleSave = () => {
    try {
      // Update settings through context
      updateSettings(settings);
      
      // Show success message
      toast({
        title: t.saved,
        description: "All settings have been updated successfully.",
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleLanguageChange = (language: string) => {
    const updatedSettings = { ...settings, language };
    setSettings(updatedSettings);
    // Don't update parent component yet - wait for save
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <SettingsIcon className="h-8 w-8 text-gray-600" />
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="company">{t.company}</TabsTrigger>
          <TabsTrigger value="system">{t.system}</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="notifications">{t.notifications}</TabsTrigger>
          <TabsTrigger value="backup">{t.backup}</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>{t.company}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>{t.companyName}</Label>
                  <Input
                    value={settings.companyName}
                    onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                  />
                </div>
                <div>
                  <Label>{t.companyPhone}</Label>
                  <Input
                    value={settings.companyPhone}
                    onChange={(e) => setSettings({...settings, companyPhone: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label>{t.companyEmail}</Label>
                <Input
                  type="email"
                  value={settings.companyEmail}
                  onChange={(e) => setSettings({...settings, companyEmail: e.target.value})}
                />
              </div>
              
              <div>
                <Label>{t.companyAddress}</Label>
                <Textarea
                  value={settings.companyAddress}
                  onChange={(e) => setSettings({...settings, companyAddress: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <SettingsIcon className="h-5 w-5" />
                <span>{t.system}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Enable Tax</Label>
                  <Switch
                    checked={settings.taxEnabled ?? true}
                    onCheckedChange={(checked) => setSettings({...settings, taxEnabled: checked})}
                  />
                </div>
                <div>
                  <Label>{t.taxRate}</Label>
                  <Input
                    type="number"
                    value={settings.taxRate}
                    onChange={(e) => setSettings({...settings, taxRate: e.target.value})}
                    disabled={!settings.taxEnabled}
                  />
                </div>
                <div>
                  <Label>Tax Type</Label>
                  <Select value={settings.taxInclusive ? 'inclusive' : 'exclusive'} onValueChange={(value) => setSettings({...settings, taxInclusive: value === 'inclusive'})} disabled={!settings.taxEnabled}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inclusive">Inclusive</SelectItem>
                      <SelectItem value="exclusive">Exclusive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t.currency}</Label>
                  <Select value={settings.currency} onValueChange={(value) => setSettings({...settings, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PKR">PKR - Pakistani Rupee</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t.dateFormat}</Label>
                  <Select value={settings.dateFormat} onValueChange={(value) => setSettings({...settings, dateFormat: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>{t.language}</Label>
                <Select value={settings.language} onValueChange={handleLanguageChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">{t.english}</SelectItem>
                    <SelectItem value="ur">{t.urdu}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Printer className="h-5 w-5" />
                <span>Billing Slip Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Template Style</Label>
                  <Select value={settings.template || 'default'} onValueChange={(value) => setSettings({...settings, template: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="modern">Modern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Pharmacy Name (Slip)</Label>
                  <Input value={settings.slipName || settings.companyName || ''} onChange={(e) => setSettings({...settings, slipName: e.target.value})} />
                </div>
                <div>
                  <Label>Footer Text</Label>
                  <Input value={settings.footerText || ''} onChange={(e) => setSettings({...settings, footerText: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Pharmacy Logo</Label>
<input
  type="file"
  accept="image/*"
  onChange={async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSettings({ ...settings, logo: ev.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  }}
/>
{settings.logo && (
  <img
    src={settings.logo}
    alt="Pharmacy Logo Preview"
    className="h-16 mt-2 rounded border shadow"
    style={{ objectFit: 'contain', background: '#fff' }}
  />
)}
                </div>
                <Label>{t.printReceipts}</Label>
                <Switch
                  checked={settings.printReceipts}
                  onCheckedChange={(checked) => setSettings({...settings, printReceipts: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label>{t.barcodeScanning}</Label>
                <Switch
                  checked={settings.barcodeScanning}
                  onCheckedChange={(checked) => setSettings({...settings, barcodeScanning: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>{t.backup}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>{t.autoBackup}</Label>
                <Switch
                  checked={settings.autoBackup}
                  onCheckedChange={(checked) => setSettings({...settings, autoBackup: checked})}
                />
              </div>
              
              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  <Database className="h-4 w-4 mr-2" />
                  Create Manual Backup
                </Button>
                <Button variant="outline" className="w-full">
                  <Database className="h-4 w-4 mr-2" />
                  Restore from Backup
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">{t.dangerZone}</h2>
        <p className="text-sm text-muted-foreground mb-4">{t.irreversibleActions}</p>
        
        <Button 
          variant="destructive"
          onClick={() => setShowDeleteDialog(true)}
        >
          {t.deleteAllData}
        </Button>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete All Data - Step {verificationStep}/3</DialogTitle>
            <DialogDescription className="text-destructive">
              {t.deleteAllDataConfirmation}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm">
              {t.typeToDelete} <span className="font-bold">"{verificationPhrases[verificationStep - 1]}"</span>
            </p>
            
            <Input 
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={`Type "${verificationPhrases[verificationStep - 1]}"`}
            />
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setVerificationStep(1);
                  setConfirmText('');
                }}
              >
                {t.cancel}
              </Button>
              
              <Button 
                variant="destructive"
                onClick={handleDeleteAllData}
              >
                {verificationStep < 3 ? t.nextVerification : t.permanentlyDeleteAllData}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="px-8">
          <Save className="h-4 w-4 mr-2" />
          {t.save}
        </Button>
      </div>
    </div>
  );
};

export default Settings;
