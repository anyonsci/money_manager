import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuickEntryView } from '../src/components/transactions/QuickEntryView';

describe('UI Component - QuickEntryView', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders default title, placeholder, and format guide', () => {
    render(<QuickEntryView onSubmit={mockOnSubmit} />);

    expect(screen.getByText('Quick entry')).toBeInTheDocument();
    const input = screen.getByPlaceholderText(/30\s+HDFC\s+Groceries/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('enterkeyhint', 'send');
    expect(input).toHaveAttribute('autocapitalize', 'none');
    expect(input).toHaveAttribute('inputmode', 'text');
    expect(screen.getByText('Quick entry format')).toBeInTheDocument();
  });

  it('renders custom title, subtitle, and custom examples', () => {
    const customExamples = [
      { text: '10 Cash food Snack', type: 'expense' as const },
      { text: '+500 Bank salary Pay', type: 'income' as const },
    ];

    render(
      <QuickEntryView
        title="Custom Header"
        subtitle="Test subtitle"
        placeholder="Custom placeholder"
        examples={customExamples}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('Custom Header')).toBeInTheDocument();
    expect(screen.getByText('Test subtitle')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
    expect(screen.getByText('10 Cash food Snack')).toBeInTheDocument();
    expect(screen.getByText('+500 Bank salary Pay')).toBeInTheDocument();
  });

  it('displays live parsed preview ABOVE input when typing a valid entry', () => {
    render(<QuickEntryView currency="USD" onSubmit={mockOnSubmit} />);
    const input = screen.getByPlaceholderText(/30\s+HDFC\s+Groceries/i);

    fireEvent.change(input, { target: { value: '45  HDFC  food.lunch  Sushi lunch' } });

    const amountText = screen.getByText('$45.00');
    expect(amountText).toBeInTheDocument();
    expect(screen.getByText('HDFC')).toBeInTheDocument();
    expect(screen.getByText('food')).toBeInTheDocument();
    expect(screen.getByText('lunch')).toBeInTheDocument();
    expect(screen.getByText(/"Sushi lunch"/i)).toBeInTheDocument();

    // Verify DOM position: preview appears before the input (top part)
    const previewContainer = amountText.closest('.bg-slate-900\\/95') || amountText.parentElement;
    expect(previewContainer).not.toBeNull();
    const position = previewContainer!.compareDocumentPosition(input);
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('displays validation error alert ABOVE input when typing an invalid entry', () => {
    render(<QuickEntryView onSubmit={mockOnSubmit} />);
    const input = screen.getByPlaceholderText(/30\s+HDFC\s+Groceries/i);

    fireEvent.change(input, { target: { value: 'invalid_data' } });

    const errorAlert = screen.getByText(/Invalid amount/i);
    expect(errorAlert).toBeInTheDocument();

    const alertBox = errorAlert.closest('.bg-amber-950\\/50') || errorAlert.parentElement;
    expect(alertBox).not.toBeNull();
    const position = alertBox!.compareDocumentPosition(input);
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('displays progressive partial preview without error alert when typing initial amount and account', () => {
    render(<QuickEntryView currency="USD" onSubmit={mockOnSubmit} />);
    const input = screen.getByPlaceholderText(/30\s+HDFC\s+Groceries/i);

    // 1. User types only amount: "30"
    fireEvent.change(input, { target: { value: '30' } });

    // Should show $30.00 and next field hint without any error box
    expect(screen.getByText('$30.00')).toBeInTheDocument();
    expect(screen.getByText(/Select or type Account/i)).toBeInTheDocument();
    expect(screen.queryByText(/Invalid/i)).not.toBeInTheDocument();

    // 2. User types amount and account: "30  HDFC"
    fireEvent.change(input, { target: { value: '30  HDFC' } });

    expect(screen.getByText('$30.00')).toBeInTheDocument();
    expect(screen.getAllByText('HDFC').length).toBeGreaterThan(0);
    expect(screen.getByText(/Select or type Category/i)).toBeInTheDocument();
    expect(screen.queryByText(/Invalid/i)).not.toBeInTheDocument();

    // 3. User types invalid category: "30  HDFC  invalidcategory"
    fireEvent.change(input, { target: { value: '30  HDFC  invalidcategory' } });
    expect(screen.getByText(/Category "invalidcategory" is invalid/i)).toBeInTheDocument();
  });

  it('supports prefix-matched category and subcategory in live preview', () => {
    render(<QuickEntryView currency="USD" onSubmit={mockOnSubmit} />);
    const input = screen.getByPlaceholderText(/30\s+HDFC\s+Groceries/i);

    // Prefix "trav" should match "travel" and show complete preview
    fireEvent.change(input, { target: { value: '60  Checking  trav.flight  Flight ticket' } });

    expect(screen.getByText('$60.00')).toBeInTheDocument();
    expect(screen.getByText('Checking')).toBeInTheDocument();
    expect(screen.getByText('travel')).toBeInTheDocument();
    expect(screen.getByText('flight')).toBeInTheDocument();
    expect(screen.getByText(/"Flight ticket"/i)).toBeInTheDocument();
    expect(screen.getByText('Ready to save ↵')).toBeInTheDocument();
  });

  it('submits valid entry, triggers onSubmit, shows success confirmation ABOVE input, and resets input', async () => {
    mockOnSubmit.mockResolvedValueOnce(undefined);

    render(
      <QuickEntryView
        currency="USD"
        successMessage="Custom success notification"
        onSubmit={mockOnSubmit}
      />
    );
    const input = screen.getByPlaceholderText(/30\s+HDFC\s+Groceries/i);
    const form = input.closest('form')!;

    fireEvent.change(input, { target: { value: '30  HDFC  food.lunch  Meal' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: '30',
          account: 'HDFC',
          category: 'food',
          subCategory: 'lunch',
        })
      );
    });

    const successMessage = await screen.findByText('Custom success notification');
    expect(successMessage).toBeInTheDocument();

    const successBanner = successMessage.closest('.bg-emerald-950\\/60') || successMessage.parentElement;
    expect(successBanner).not.toBeNull();
    const position = successBanner!.compareDocumentPosition(input);
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    expect(input).toHaveValue('');
  });

  it('displays error banner ABOVE input if onSubmit rejects', async () => {
    mockOnSubmit.mockRejectedValueOnce(new Error('Network failure'));

    render(<QuickEntryView onSubmit={mockOnSubmit} />);
    const input = screen.getByPlaceholderText(/30\s+HDFC\s+Groceries/i);
    const form = input.closest('form')!;

    fireEvent.change(input, { target: { value: '30  HDFC  food  Meal' } });
    fireEvent.submit(form);

    const errorMessage = await screen.findByText('Network failure');
    expect(errorMessage).toBeInTheDocument();

    const errorBanner = errorMessage.closest('.bg-rose-950\\/60') || errorMessage.parentElement;
    expect(errorBanner).not.toBeNull();
    const position = errorBanner!.compareDocumentPosition(input);
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('disables input and submit button when isSubmitting is true', () => {
    render(<QuickEntryView isSubmitting={true} onSubmit={mockOnSubmit} />);
    const input = screen.getByPlaceholderText(/30\s+HDFC\s+Groceries/i);
    const button = screen.getByTitle(/Save Transaction/i);

    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
  });

  it('renders account suggestions ABOVE input when entering amount and space, and auto-advances to category', () => {
    render(
      <QuickEntryView
        accounts={['Axis Bank', 'Paytm Wallet']}
        onSubmit={mockOnSubmit}
      />
    );
    const input = screen.getByPlaceholderText(/30\s+HDFC\s+Groceries/i);

    // Enter amount followed by space to enter account field
    fireEvent.change(input, { target: { value: '50 ' } });

    const suggestions = screen.getByTestId('quick-entry-suggestions');
    expect(suggestions).toBeInTheDocument();
    expect(screen.getByText('🏦 Account')).toBeInTheDocument();
    expect(screen.getByText('Axis Bank')).toBeInTheDocument();
    expect(screen.getByText('Paytm Wallet')).toBeInTheDocument();

    // Verify DOM position: suggestions bar appears ABOVE the input
    const position = suggestions.compareDocumentPosition(input);
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    // Click on Axis Bank account chip
    fireEvent.click(screen.getByText('Axis Bank'));

    // Input should be updated and transitioned to category field
    expect(input).toHaveValue('50  Axis Bank  ');

    // Immediately shows category suggestions!
    expect(screen.getByText('🏷️ Category')).toBeInTheDocument();
    expect(screen.getByTestId('suggestion-food')).toBeInTheDocument();

    // Click on food category chip
    fireEvent.click(screen.getByTestId('suggestion-food'));

    // Input should be updated with category and transitioned to note field
    expect(input).toHaveValue('50  Axis Bank  food  ');

    // Suggestions should close once in note field
    expect(screen.queryByTestId('quick-entry-suggestions')).not.toBeInTheDocument();
  });

  it('filters suggestions as user types', () => {
    render(
      <QuickEntryView
        accounts={['Axis Bank', 'Paytm Wallet', 'HDFC']}
        onSubmit={mockOnSubmit}
      />
    );
    const input = screen.getByPlaceholderText(/30\s+HDFC\s+Groceries/i);

    // Type partial account name
    fireEvent.change(input, { target: { value: '50  hd' } });

    expect(screen.getByText('HDFC')).toBeInTheDocument();
    expect(screen.queryByText('Axis Bank')).not.toBeInTheDocument();
    expect(screen.queryByText('Cash')).not.toBeInTheDocument();
  });

  it('supports keyboard navigation and selection with ArrowDown and Enter', () => {
    render(
      <QuickEntryView
        accounts={['Axis Bank', 'HDFC']}
        onSubmit={mockOnSubmit}
      />
    );
    const input = screen.getByPlaceholderText(/30\s+HDFC\s+Groceries/i);

    fireEvent.change(input, { target: { value: '50 ' } });
    expect(screen.getByTestId('quick-entry-suggestions')).toBeInTheDocument();

    // Arrow down to highlight first item (Axis Bank)
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    // Press Enter to select
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(input).toHaveValue('50  Axis Bank  ');
  });

  it('supports Tab autocomplete for suggestions', () => {
    render(
      <QuickEntryView
        accounts={['Axis Bank', 'HDFC']}
        onSubmit={mockOnSubmit}
      />
    );
    const input = screen.getByPlaceholderText(/30\s+HDFC\s+Groceries/i);

    fireEvent.change(input, { target: { value: '50 ' } });

    // Pressing Tab directly selects the first suggestion
    fireEvent.keyDown(input, { key: 'Tab' });

    expect(input).toHaveValue('50  Axis Bank  ');
  });

  it('closes suggestions when Escape key is pressed', () => {
    render(<QuickEntryView onSubmit={mockOnSubmit} />);
    const input = screen.getByPlaceholderText(/30\s+HDFC\s+Groceries/i);

    fireEvent.change(input, { target: { value: '50 ' } });
    expect(screen.getByTestId('quick-entry-suggestions')).toBeInTheDocument();

    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByTestId('quick-entry-suggestions')).not.toBeInTheDocument();
  });
});
