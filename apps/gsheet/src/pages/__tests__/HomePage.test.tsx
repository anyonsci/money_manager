import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HomePage } from '../HomePage';

const mockCreateTransactionItem = jest.fn();
let mockTransactionsList: any[] = [];

jest.mock('../../context/TransactionContext', () => ({
  useTransactions: () => ({
    transactions: mockTransactionsList,
    createTransactionItem: mockCreateTransactionItem,
  }),
}));

describe('gsheet HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTransactionsList = [];
  });

  test('renders title, input, and format guide', () => {
    render(<HomePage />);
    expect(screen.getByText('Quick entry')).toBeInTheDocument();
    const input = screen.getByPlaceholderText(/30\s+diners cc\s+food\.lunch/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('enterkeyhint', 'send');
    expect(input).toHaveAttribute('autocapitalize', 'none');
    expect(screen.getByText('Quick entry format')).toBeInTheDocument();
  });

  test('displays live parsed transaction preview ABOVE input when typing valid transaction', () => {
    render(<HomePage />);
    const input = screen.getByPlaceholderText(/30\s+diners cc\s+food\.lunch/i);

    fireEvent.change(input, { target: { value: '30  diners cc  food.lunch  Office lunch' } });

    const amountText = screen.getByText(/30\.00/);
    expect(amountText).toBeInTheDocument();
    expect(screen.getByText('diners cc')).toBeInTheDocument();
    expect(screen.getByText('food')).toBeInTheDocument();
    expect(screen.getByText('lunch')).toBeInTheDocument();
    expect(screen.getByText(/"Office lunch"/i)).toBeInTheDocument();

    // Verify DOM position: preview must precede input in document flow (top part)
    const previewContainer = amountText.closest('.bg-slate-900\\/95') || amountText.parentElement;
    expect(previewContainer).not.toBeNull();
    const position = previewContainer!.compareDocumentPosition(input);
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  test('displays validation error alert ABOVE input when entry is invalid', () => {
    render(<HomePage />);
    const input = screen.getByPlaceholderText(/30\s+diners cc\s+food\.lunch/i);

    fireEvent.change(input, { target: { value: 'abc, diners cc, food' } });

    const errorAlert = screen.getByText(/Invalid amount/i);
    expect(errorAlert).toBeInTheDocument();

    const alertBox = errorAlert.closest('.bg-amber-950\\/50') || errorAlert.parentElement;
    expect(alertBox).not.toBeNull();
    const position = alertBox!.compareDocumentPosition(input);
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  test('submits valid entry and renders success confirmation ABOVE input', async () => {
    mockCreateTransactionItem.mockResolvedValueOnce({
      id: 'tx-1',
      amount: 30,
      account: 'diners cc',
      category: 'food',
      subCategory: 'lunch',
      date: '2025-01-01',
      type: 'expense',
    });

    render(<HomePage />);
    const input = screen.getByPlaceholderText(/30\s+diners cc\s+food\.lunch/i);
    const form = input.closest('form')!;

    fireEvent.change(input, { target: { value: '30  diners cc  food.lunch  Office lunch' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockCreateTransactionItem).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: '30',
          account: 'diners cc',
          category: 'food',
          subCategory: 'lunch',
        })
      );
    });

    const successMessage = await screen.findByText(/Saved successfully!/i);
    expect(successMessage).toBeInTheDocument();

    const successBanner = successMessage.closest('.bg-emerald-950\\/60') || successMessage.parentElement;
    expect(successBanner).not.toBeNull();
    const position = successBanner!.compareDocumentPosition(input);
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    expect(input).toHaveValue('');
  });

  test('derives accounts from transactions and renders account suggestions', () => {
    mockTransactionsList = [{ account: 'Kotak Bank' }, { account: 'Cash' }];

    render(<HomePage />);
    const input = screen.getByPlaceholderText(/30\s+diners cc\s+food\.lunch/i);
    fireEvent.change(input, { target: { value: '25 ' } });

    expect(screen.getByText('Kotak Bank')).toBeInTheDocument();
  });
});
