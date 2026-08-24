import React, { useState } from 'react';
import { TransactionModal } from '@money-manager/ui';
import { UnifiedTransaction, TransactionFormValues } from '@money-manager/core';

const initialEditTx: UnifiedTransaction = {
  id: 'tx-modal-edit-1',
  amount: 3200,
  type: 'expense',
  category: 'Food & Dining',
  subCategory: 'Groceries',
  account: 'HDFC Bank',
  note: 'Organic store vegetables & fruits',
  transactionDate: '2026-08-18',
  status: 'CLEARED'
};

export const TransactionModalFixture: React.FC = () => {
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState<string>('None');

  const handleSubmit = async (values: TransactionFormValues) => {
    setLastSubmitted(JSON.stringify(values));
  };

  return (
    <div className="p-8 max-w-xl mx-auto space-y-6" data-testid="modal-fixture-container">
      <div className="flex gap-4">
        <button
          id="btn-open-create"
          type="button"
          onClick={() => setIsOpenCreate(true)}
          className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-500 shadow-md transition"
        >
          Open Create Transaction Modal
        </button>

        <button
          id="btn-open-edit"
          type="button"
          onClick={() => setIsOpenEdit(true)}
          className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 shadow-md transition"
        >
          Open Edit Transaction Modal
        </button>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs">
        <p className="text-slate-500 font-semibold uppercase mb-1">Last Submitted Payload:</p>
        <pre data-testid="submitted-payload" className="font-mono text-emerald-400 break-all whitespace-pre-wrap">
          {lastSubmitted}
        </pre>
      </div>

      {/* Create Modal */}
      <TransactionModal
        open={isOpenCreate}
        mode="create"
        defaultAccount="Checking"
        onClose={() => setIsOpenCreate(false)}
        onSubmit={handleSubmit}
      />

      {/* Edit Modal */}
      <TransactionModal
        open={isOpenEdit}
        mode="edit"
        transaction={initialEditTx}
        onClose={() => setIsOpenEdit(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
