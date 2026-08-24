import React, { useState } from 'react';
import { Modal } from '@money-manager/ui';

export const ModalFixture: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [counter, setCounter] = useState(0);

  return (
    <div className="p-8 max-w-xl mx-auto space-y-6" data-testid="modal-standalone-container">
      <div>
        <button
          id="btn-open-generic-modal"
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-500 shadow-md transition"
        >
          Open Generic Modal
        </button>
      </div>

      <div className="text-xs text-slate-400">
        Action counter: <span data-testid="counter-value" className="font-bold text-white">{counter}</span>
      </div>

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Custom Confirmation Modal"
      >
        <div className="space-y-4" data-testid="modal-inner-content">
          <p className="text-sm text-slate-300">
            This is a generic reusable modal dialog from @money-manager/ui.
          </p>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <button
              id="btn-modal-cancel"
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              id="btn-modal-confirm"
              type="button"
              onClick={() => {
                setCounter((c) => c + 1);
                setIsOpen(false);
              }}
              className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-500"
            >
              Confirm Action
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
