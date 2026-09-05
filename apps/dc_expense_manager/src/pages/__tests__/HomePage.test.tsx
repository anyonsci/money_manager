import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HomePage } from '../HomePage';

const mockAddTransaction = jest.fn();
let mockTransactionsList: any[] = [];
const mockActiveWorkspace = {
  id: 'ws-1',
  name: 'Default Workspace',
  defaultCurrency: 'USD',
};

jest.mock('../../context/TransactionContext', () => ({
  useTransactions: () => ({
    transactions: mockTransactionsList,
    addTransaction: mockAddTransaction,
    isSubmitting: false,
  }),
}));

jest.mock('@money-manager/dc-client', () => ({
  useWorkspace: () => ({
    activeWorkspace: mockActiveWorkspace,
  }),
}));

describe('dc_expense_manager HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTransactionsList = [];
  });

  test('renders title, input, and format guide', () => {
    render(<HomePage />);
    expect(screen.getByText('DC Expense')).toBeInTheDocument();
    const input = screen.getByPlaceholderText(/30\s+HDFC\s+Groceries/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('enterkeyhint', 'send');
    expect(input).toHaveAttribute('autocapitalize', 'none');
    expect(screen.getByText('Quick entry format')).toBeInTheDocument();
  });

  test('displays live parsed transaction preview ABOVE input when typing valid transaction', () => {
    render(<HomePage />);
    const input = screen.getByPlaceholderText(/30\s+HDFC\s+Groceries/i);

    fireEvent.change(input, { target: { value: '45  HDFC  food.lunch  Sushi meal' } });

    // Live preview elements
    const amountText = screen.getByText('$45.00');
    expect(amountText).toBeInTheDocument();
    expect(screen.getByText('HDFC')).toBeInTheDocument();
    expect(screen.getByText('food')).toBeInTheDocument();
    expect(screen.getByText('lunch')).toBeInTheDocument();
    expect(screen.getByText(/"Sushi meal"/i)).toBeInTheDocument();

    // Verify DOM position: preview must precede input in document flow (top part)
    const previewContainer = amountText.closest('.bg-slate-900\\/95') || amountText.parentElement;
    expect(previewContainer).not.toBeNull();
    const position = previewContainer!.compareDocumentPosition(input);
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  test('displays validation error alert ABOVE input when entry is invalid', () => {
    render(<HomePage />);
    const input = screen.getByPlaceholderText(/30\s+HDFC\s+Groceries/i);

    // Provide invalid format (e.g. non-numeric amount)
    fireEvent.change(input, { target: { value: 'abc, Cash, food' } });

    const errorAlert = screen.getByText(/Invalid amount/i);
    expect(errorAlert).toBeInTheDocument();

    // Verify error is situated before the input in document flow
    const alertBox = errorAlert.closest('.bg-amber-950\\/50') || errorAlert.parentElement;
    expect(alertBox).not.toBeNull();
    const position = alertBox!.compareDocumentPosition(input);
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  test('submits valid entry and renders success confirmation ABOVE input', async () => {
    mockAddTransaction.mockResolvedValueOnce(undefined);

    render(<HomePage />);
    const input = screen.getByPlaceholderText(/30\s+HDFC\s+Groceries/i);
    const form = input.closest('form')!;

    fireEvent.change(input, { target: { value: '50  Cash  food  Dinner' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockAddTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: '50',
          account: 'Cash',
          category: 'food',
        })
      );
    });

    const successMessage = await screen.findByText(/Saved successfully!/i);
    expect(successMessage).toBeInTheDocument();

    // Verify success banner is located before input
    const successBanner = successMessage.closest('.bg-emerald-950\\/60') || successMessage.parentElement;
    expect(successBanner).not.toBeNull();
    const position = successBanner!.compareDocumentPosition(input);
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    // Input should be cleared
    expect(input).toHaveValue('');
  });

  test('derives accounts from transactions and renders account suggestions', () => {
    mockTransactionsList = [{ account: 'Axis Platinum' }, { account: 'Cash' }];

    render(<HomePage />);
    const input = screen.getByPlaceholderText(/30\s+HDFC\s+Groceries/i);
    fireEvent.change(input, { target: { value: '25 ' } });

    expect(screen.getByText('Axis Platinum')).toBeInTheDocument();
  });
});
