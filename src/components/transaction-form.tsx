// Transaction Form component for creating new transactions
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { useCreateTransaction } from '@/lib/queries';
import { useAppStore } from '@/lib/store';
import { validateTransactionAmount, formatCurrency } from '@/lib/utils';
import { Loader2, DollarSign } from 'lucide-react';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionForm({ isOpen, onClose }: TransactionFormProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ amount?: string; description?: string }>({});
  
  const currentUser = useAppStore((state) => state.currentUser);
  const setError = useAppStore((state) => state.setError);
  
  const createTransactionMutation = useCreateTransaction();

  const validateForm = () => { // eslint-disable-line @typescript-eslint/no-unused-vars
    const newErrors: { amount?: string; description?: string } = {};
    
    // Validate amount
    const amountValidation = validateTransactionAmount(amount);
    if (!amountValidation.isValid) {
      newErrors.amount = amountValidation.error;
    }
    
    // Validate description
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.trim().length < 3) {
      newErrors.description = 'Description must be at least 3 characters';
    } else if (description.trim().length > 255) {
      newErrors.description = 'Description must be less than 255 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if we should use quick form data
    const quickAmountInput = document.getElementById('quick-amount') as HTMLInputElement;
    const quickDateInput = document.getElementById('quick-date') as HTMLInputElement;
    
    const finalAmount = amount || quickAmountInput?.value || '';
    const finalDescription = description || `Purchase on ${quickDateInput?.value || new Date().toISOString().split('T')[0]}`;
    
    // Validate with final values
    const amountValidation = validateTransactionAmount(finalAmount);
    if (!amountValidation.isValid) {
      setErrors({ amount: amountValidation.error });
      return;
    }
    
    if (!finalDescription.trim()) {
      setErrors({ description: 'Description is required' });
      return;
    }
    
    if (!currentUser) {
      return;
    }

    try {
      await createTransactionMutation.mutateAsync({
        amount: parseFloat(finalAmount),
        description: finalDescription.trim(),
        userId: currentUser.id,
        teamId: currentUser.teamId,
      });
      
      // Reset form and inputs
      setAmount('');
      setDescription('');
      setErrors({});
      if (quickAmountInput) quickAmountInput.value = '';
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create transaction');
    }
  };

  const handleClose = () => {
    if (!createTransactionMutation.isPending) {
      setAmount('');
      setDescription('');
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <DollarSign style={{ color: 'var(--brand-yellow)' }} className="h-5 w-5" />
            <span>Execute purchase</span>
          </DialogTitle>
          <DialogDescription>
            Enter purchase details. The system will automatically select the optimal budget.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (EUR)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              max="10000"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={errors.amount ? 'border-red-500' : ''}
              disabled={createTransactionMutation.isPending}
            />
            {errors.amount && (
              <p className="text-sm text-red-600">{errors.amount}</p>
            )}
            {amount && !errors.amount && (
              <p className="text-sm text-green-600">
                Transaction amount: {formatCurrency(parseFloat(amount) || 0)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              type="text"
              placeholder="What is this transaction for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={errors.description ? 'border-red-500' : ''}
              disabled={createTransactionMutation.isPending}
              maxLength={255}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
            <p className="text-xs text-gray-500">
              {description.length}/255 characters
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createTransactionMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createTransactionMutation.isPending || !amount || !description.trim()}
              style={{ 
                backgroundColor: 'var(--brand-navy)', 
                color: 'white',
                border: 'none'
              }}
              className="hover:opacity-90 transition-opacity w-full"
            >
              {createTransactionMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
