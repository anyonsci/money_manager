import { parseCsvTransaction } from '../src/domain/quickEntryParser';

describe('Core Domain - Quick Entry Parser', () => {
  describe('parseCsvTransaction', () => {
    it('returns error when input is empty or whitespace only', () => {
      const result1 = parseCsvTransaction('');
      expect(result1.valid).toBe(false);
      expect(result1.error).toContain('Enter entry as: amount  account  category');

      const result2 = parseCsvTransaction('   \t  \n ');
      expect(result2.valid).toBe(false);
    });

    it('returns error when input has fewer than 3 parts', () => {
      const result = parseCsvTransaction('100, HDFC');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Requires at least 3 parts');
    });

    it('parses valid comma-separated entry', () => {
      const result = parseCsvTransaction('500, HDFC, food, Dinner with friends', '2025-01-15');
      expect(result.valid).toBe(true);
      expect(result.values).toEqual({
        amount: '500',
        account: 'HDFC',
        category: 'food',
        subCategory: '',
        note: 'Dinner with friends',
        type: 'expense',
        date: '2025-01-15',
      });
    });

    it('parses valid multi-space separated entry', () => {
      const result = parseCsvTransaction('1200  Cash  travel  Bus ticket', '2025-02-10');
      expect(result.valid).toBe(true);
      expect(result.values).toEqual({
        amount: '1200',
        account: 'Cash',
        category: 'travel',
        subCategory: '',
        note: 'Bus ticket',
        type: 'expense',
        date: '2025-02-10',
      });
    });

    it('parses valid single-space entry with a one-word account', () => {
      const result = parseCsvTransaction('1200 Cash travel Bus ticket', '2025-02-10');
      expect(result.valid).toBe(true);
      expect(result.values).toEqual({
        amount: '1200',
        account: 'Cash',
        category: 'travel',
        subCategory: '',
        note: 'Bus ticket',
        type: 'expense',
        date: '2025-02-10',
      });
    });

    it('parses a single-space entry with a two-word account and subcategory', () => {
      const result = parseCsvTransaction('1200 Cash Wallet food.groceries Weekly vegetables', '2025-02-10');
      expect(result.valid).toBe(true);
      expect(result.values).toEqual({
        amount: '1200',
        account: 'Cash Wallet',
        category: 'food',
        subCategory: 'groceries',
        note: 'Weekly vegetables',
        type: 'expense',
        date: '2025-02-10',
      });
    });

    it('keeps the single-space fallback limited to two account words', () => {
      const result = parseCsvTransaction('1200 Cash Wallet Account food');
      expect(result.valid).toBe(false);
    });

    it('parses subcategory separated by a dot', () => {
      const result = parseCsvTransaction('250, ICICI, food.groceries, Weekly vegetables', '2025-03-01');
      expect(result.valid).toBe(true);
      expect(result.values).toEqual({
        amount: '250',
        account: 'ICICI',
        category: 'food',
        subCategory: 'groceries',
        note: 'Weekly vegetables',
        type: 'expense',
        date: '2025-03-01',
      });
    });

    it('identifies income when amount starts with +', () => {
      const result = parseCsvTransaction('+5000, Bank, others, Bonus received', '2025-04-01');
      expect(result.valid).toBe(true);
      expect(result.values?.type).toBe('income');
      expect(result.values?.amount).toBe('5000');
    });

    it('identifies income for salary/income/freelance keywords', () => {
      const resultSalary = parseCsvTransaction('50000, Checking, salary, Monthly salary');
      expect(resultSalary.valid).toBe(true);
      expect(resultSalary.values?.type).toBe('income');
    });

    it('identifies expense when amount starts with -', () => {
      const result = parseCsvTransaction('-150, Cash, food, Lunch');
      expect(result.valid).toBe(true);
      expect(result.values?.type).toBe('expense');
      expect(result.values?.amount).toBe('150');
    });

    it('rejects invalid amounts (letters or <= 0)', () => {
      const invalidNumber = parseCsvTransaction('abc, Cash, food');
      expect(invalidNumber.valid).toBe(false);
      expect(invalidNumber.error).toContain('Invalid amount');

      const zeroAmount = parseCsvTransaction('0, Cash, food');
      expect(zeroAmount.valid).toBe(false);
      expect(zeroAmount.error).toContain('Invalid amount');

      const negativeZero = parseCsvTransaction('-0, Cash, food');
      expect(negativeZero.valid).toBe(false);
    });

    it('rejects invalid category and lists allowed ones', () => {
      const result = parseCsvTransaction('500, Cash, NonExistentCategory');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Category "NonExistentCategory" is invalid');
    });

    it('handles empty category prefix before dot', () => {
      const result = parseCsvTransaction('500, Cash, .groceries');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Category name cannot be empty');
    });

    it('uses current date if defaultDate is not supplied', () => {
      const result = parseCsvTransaction('50, Cash, food, Tea');
      expect(result.valid).toBe(true);
      expect(result.values?.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('joins multiple trailing parts into note', () => {
      const result = parseCsvTransaction('300, Card, entertainment, Movie, Popcorn, IMAX');
      expect(result.valid).toBe(true);
      expect(result.values?.note).toBe('Movie, Popcorn, IMAX');
    });

    it('resolves category via prefix matching in comma and double-space formats', () => {
      // 'f' resolves to 'food'
      const resF = parseCsvTransaction('30, HDFC, f, Lunch');
      expect(resF.valid).toBe(true);
      expect(resF.values?.category).toBe('food');

      // 'sal' resolves to 'salary' and income
      const resSal = parseCsvTransaction('5000  Checking  sal  Monthly salary');
      expect(resSal.valid).toBe(true);
      expect(resSal.values?.category).toBe('salary');
      expect(resSal.values?.type).toBe('income');

      // 'tra' resolves to 'travel', 'tri' resolves to 'trip'
      const resTra = parseCsvTransaction('150  Card  tra  Flight');
      expect(resTra.valid).toBe(true);
      expect(resTra.values?.category).toBe('travel');

      const resTri = parseCsvTransaction('80  Cash  tri  Weekend trip');
      expect(resTri.valid).toBe(true);
      expect(resTri.values?.category).toBe('trip');

      // Prefix with subcategory e.g. f.fruits
      const resSub = parseCsvTransaction('25  Cash  f.fruits  Apples');
      expect(resSub.valid).toBe(true);
      expect(resSub.values?.category).toBe('food');
      expect(resSub.values?.subCategory).toBe('fruits');
    });

    it('resolves category via prefix matching in single-space format', () => {
      const resSingle = parseCsvTransaction('40 HDFC f Lunch note');
      expect(resSingle.valid).toBe(true);
      expect(resSingle.values?.category).toBe('food');
      expect(resSingle.values?.account).toBe('HDFC');
      expect(resSingle.values?.note).toBe('Lunch note');

      const resTwoWord = parseCsvTransaction('60 diners cc tra Train ticket');
      expect(resTwoWord.valid).toBe(true);
      expect(resTwoWord.values?.category).toBe('travel');
      expect(resTwoWord.values?.account).toBe('diners cc');
    });

    it('returns informative error for ambiguous category prefixes', () => {
      const resAmbiguous = parseCsvTransaction('30  HDFC  t  Some note');
      expect(resAmbiguous.valid).toBe(false);
      expect(resAmbiguous.error).toContain('Category prefix "t" matches multiple: travel, trip');
    });
  });
});

