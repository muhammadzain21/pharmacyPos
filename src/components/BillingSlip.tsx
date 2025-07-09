import React from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

type BillingItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  discount?: number;
};

type BillingSlipProps = {
  items: BillingItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  onPrint?: () => void;
  onClose?: () => void;
};

export const BillingSlip: React.FC<BillingSlipProps> = ({
  items,
  subtotal,
  tax,
  discount,
  total,
  onPrint,
  onClose
}) => {
  const { settings } = useSettings();
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-lg print:p-0 print:shadow-none">
      {/* Pharmacy Header */}
      <div className="text-center mb-4 border-b pb-4">
        {settings.pharmacyLogo && (
          <img 
            src={settings.pharmacyLogo} 
            alt="Pharmacy Logo" 
            className="h-16 mx-auto mb-2"
          />
        )}
        <h2 className="text-xl font-bold">{settings.pharmacyName || 'Pharmacy'}</h2>
        <p className="text-sm text-gray-600">
          {settings.pharmacyAddress || 'Address not specified'}
        </p>
        <p className="text-sm text-gray-600">
          {settings.pharmacyPhone || 'Phone not specified'}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          {format(new Date(), 'dd MMM yyyy hh:mm a')}
        </p>
      </div>
      
      {/* Items Table */}
      <div className="mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Item</th>
              <th className="text-right py-2">Qty</th>
              <th className="text-right py-2">Price</th>
              <th className="text-right py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="py-2">{item.name}</td>
                <td className="text-right py-2">{item.quantity}</td>
                <td className="text-right py-2">{item.price.toFixed(2)}</td>
                <td className="text-right py-2">
                  {(item.quantity * item.price).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Totals */}
      <div className="border-t pt-2 mb-4">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{subtotal.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-red-600">
            <span>Discount:</span>
            <span>-{discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Tax ({settings.taxRate || 0}%):</span>
          <span>{tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold mt-2">
          <span>Total:</span>
          <span>{total.toFixed(2)}</span>
        </div>
      </div>
      
      {/* Footer */}
      <div className="text-center text-xs text-gray-500 mb-4">
        <p>{settings.slogan || 'Thank you for your purchase!'}</p>
        <p>{settings.footerText || 'Your health is our priority'}</p>
      </div>
      
      {/* Actions */}
      <div className="flex justify-end gap-2 print:hidden">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button onClick={onPrint}>
          Print Receipt
        </Button>
      </div>
    </div>
  );
};

export default BillingSlip;
