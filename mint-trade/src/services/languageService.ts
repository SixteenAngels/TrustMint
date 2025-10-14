import { Language, Translation, LocalizedString, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../types/ai';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class LanguageService {
  private static instance: LanguageService;
  private currentLanguage: string = DEFAULT_LANGUAGE;
  private translations: Map<string, Translation> = new Map();

  static getInstance(): LanguageService {
    if (!LanguageService.instance) {
      LanguageService.instance = new LanguageService();
    }
    return LanguageService.instance;
  }

  constructor() {
    this.initializeTranslations();
  }

  // Initialize translations
  private initializeTranslations() {
    // English translations
    this.addTranslation('app_name', 'Mint Trade', 'en');
    this.addTranslation('app_tagline', 'Invest Smart. Trade Local. Grow Global.', 'en');
    this.addTranslation('welcome', 'Welcome to Mint Trade', 'en');
    this.addTranslation('dashboard', 'Dashboard', 'en');
    this.addTranslation('markets', 'Markets', 'en');
    this.addTranslation('portfolio', 'Portfolio', 'en');
    this.addTranslation('wallet', 'Wallet', 'en');
    this.addTranslation('social', 'Social', 'en');
    this.addTranslation('learn', 'Learn', 'en');
    this.addTranslation('profile', 'Profile', 'en');
    this.addTranslation('notifications', 'Notifications', 'en');
    this.addTranslation('settings', 'Settings', 'en');
    this.addTranslation('language', 'Language', 'en');
    this.addTranslation('theme', 'Theme', 'en');
    this.addTranslation('logout', 'Logout', 'en');
    this.addTranslation('login', 'Login', 'en');
    this.addTranslation('signup', 'Sign Up', 'en');
    this.addTranslation('phone_number', 'Phone Number', 'en');
    this.addTranslation('password', 'Password', 'en');
    this.addTranslation('confirm_password', 'Confirm Password', 'en');
    this.addTranslation('forgot_password', 'Forgot Password?', 'en');
    this.addTranslation('buy', 'Buy', 'en');
    this.addTranslation('sell', 'Sell', 'en');
    this.addTranslation('hold', 'Hold', 'en');
    this.addTranslation('price', 'Price', 'en');
    this.addTranslation('change', 'Change', 'en');
    this.addTranslation('volume', 'Volume', 'en');
    this.addTranslation('market_cap', 'Market Cap', 'en');
    this.addTranslation('pe_ratio', 'P/E Ratio', 'en');
    this.addTranslation('dividend', 'Dividend', 'en');
    this.addTranslation('high', 'High', 'en');
    this.addTranslation('low', 'Low', 'en');
    this.addTranslation('open', 'Open', 'en');
    this.addTranslation('close', 'Close', 'en');
    this.addTranslation('previous_close', 'Previous Close', 'en');
    this.addTranslation('day_change', 'Day Change', 'en');
    this.addTranslation('total_return', 'Total Return', 'en');
    this.addTranslation('portfolio_value', 'Portfolio Value', 'en');
    this.addTranslation('available_balance', 'Available Balance', 'en');
    this.addTranslation('add_money', 'Add Money', 'en');
    this.addTranslation('send_money', 'Send Money', 'en');
    this.addTranslation('pay_bills', 'Pay Bills', 'en');
    this.addTranslation('withdraw', 'Withdraw', 'en');
    this.addTranslation('transactions', 'Transactions', 'en');
    this.addTranslation('recent_activity', 'Recent Activity', 'en');
    this.addTranslation('quick_actions', 'Quick Actions', 'en');
    this.addTranslation('market_overview', 'Market Overview', 'en');
    this.addTranslation('top_gainers', 'Top Gainers', 'en');
    this.addTranslation('top_losers', 'Top Losers', 'en');
    this.addTranslation('sectors', 'Sectors', 'en');
    this.addTranslation('search', 'Search', 'en');
    this.addTranslation('filter', 'Filter', 'en');
    this.addTranslation('sort', 'Sort', 'en');
    this.addTranslation('loading', 'Loading...', 'en');
    this.addTranslation('error', 'Error', 'en');
    this.addTranslation('success', 'Success', 'en');
    this.addTranslation('warning', 'Warning', 'en');
    this.addTranslation('info', 'Information', 'en');
    this.addTranslation('confirm', 'Confirm', 'en');
    this.addTranslation('cancel', 'Cancel', 'en');
    this.addTranslation('save', 'Save', 'en');
    this.addTranslation('delete', 'Delete', 'en');
    this.addTranslation('edit', 'Edit', 'en');
    this.addTranslation('share', 'Share', 'en');
    this.addTranslation('copy', 'Copy', 'en');
    this.addTranslation('refresh', 'Refresh', 'en');
    this.addTranslation('retry', 'Retry', 'en');
    this.addTranslation('done', 'Done', 'en');
    this.addTranslation('next', 'Next', 'en');
    this.addTranslation('previous', 'Previous', 'en');
    this.addTranslation('skip', 'Skip', 'en');
    this.addTranslation('continue', 'Continue', 'en');
    this.addTranslation('back', 'Back', 'en');
    this.addTranslation('close', 'Close', 'en');
    this.addTranslation('open', 'Open', 'en');
    this.addTranslation('view', 'View', 'en');
    this.addTranslation('hide', 'Hide', 'en');
    this.addTranslation('show', 'Show', 'en');
    this.addTranslation('more', 'More', 'en');
    this.addTranslation('less', 'Less', 'en');
    this.addTranslation('all', 'All', 'en');
    this.addTranslation('none', 'None', 'en');
    this.addTranslation('select', 'Select', 'en');
    this.addTranslation('deselect', 'Deselect', 'en');
    this.addTranslation('choose', 'Choose', 'en');
    this.addTranslation('pick', 'Pick', 'en');
    this.addTranslation('enter', 'Enter', 'en');
    this.addTranslation('type', 'Type', 'en');
    this.addTranslation('input', 'Input', 'en');
    this.addTranslation('output', 'Output', 'en');
    this.addTranslation('result', 'Result', 'en');
    this.addTranslation('data', 'Data', 'en');
    this.addTranslation('information', 'Information', 'en');
    this.addTranslation('details', 'Details', 'en');
    this.addTranslation('summary', 'Summary', 'en');
    this.addTranslation('overview', 'Overview', 'en');
    this.addTranslation('analysis', 'Analysis', 'en');
    this.addTranslation('report', 'Report', 'en');
    this.addTranslation('chart', 'Chart', 'en');
    this.addTranslation('graph', 'Graph', 'en');
    this.addTranslation('table', 'Table', 'en');
    this.addTranslation('list', 'List', 'en');
    this.addTranslation('grid', 'Grid', 'en');
    this.addTranslation('card', 'Card', 'en');
    this.addTranslation('item', 'Item', 'en');
    this.addTranslation('items', 'Items', 'en');
    this.addTranslation('count', 'Count', 'en');
    this.addTranslation('total', 'Total', 'en');
    this.addTranslation('average', 'Average', 'en');
    this.addTranslation('maximum', 'Maximum', 'en');
    this.addTranslation('minimum', 'Minimum', 'en');
    this.addTranslation('range', 'Range', 'en');
    this.addTranslation('percentage', 'Percentage', 'en');
    this.addTranslation('ratio', 'Ratio', 'en');
    this.addTranslation('rate', 'Rate', 'en');
    this.addTranslation('amount', 'Amount', 'en');
    this.addTranslation('quantity', 'Quantity', 'en');
    this.addTranslation('value', 'Value', 'en');
    this.addTranslation('worth', 'Worth', 'en');
    this.addTranslation('cost', 'Cost', 'en');
    this.addTranslation('price', 'Price', 'en');
    this.addTranslation('fee', 'Fee', 'en');
    this.addTranslation('charge', 'Charge', 'en');
    this.addTranslation('tax', 'Tax', 'en');
    this.addTranslation('discount', 'Discount', 'en');
    this.addTranslation('bonus', 'Bonus', 'en');
    this.addTranslation('reward', 'Reward', 'en');
    this.addTranslation('benefit', 'Benefit', 'en');
    this.addTranslation('advantage', 'Advantage', 'en');
    this.addTranslation('disadvantage', 'Disadvantage', 'en');
    this.addTranslation('pros', 'Pros', 'en');
    this.addTranslation('cons', 'Cons', 'en');
    this.addTranslation('positive', 'Positive', 'en');
    this.addTranslation('negative', 'Negative', 'en');
    this.addTranslation('neutral', 'Neutral', 'en');
    this.addTranslation('good', 'Good', 'en');
    this.addTranslation('bad', 'Bad', 'en');
    this.addTranslation('excellent', 'Excellent', 'en');
    this.addTranslation('poor', 'Poor', 'en');
    this.addTranslation('great', 'Great', 'en');
    this.addTranslation('terrible', 'Terrible', 'en');
    this.addTranslation('amazing', 'Amazing', 'en');
    this.addTranslation('awful', 'Awful', 'en');
    this.addTranslation('wonderful', 'Wonderful', 'en');
    this.addTranslation('horrible', 'Horrible', 'en');
    this.addTranslation('fantastic', 'Fantastic', 'en');
    this.addTranslation('disgusting', 'Disgusting', 'en');
    this.addTranslation('beautiful', 'Beautiful', 'en');
    this.addTranslation('ugly', 'Ugly', 'en');
    this.addTranslation('pretty', 'Pretty', 'en');
    this.addTranslation('handsome', 'Handsome', 'en');
    this.addTranslation('cute', 'Cute', 'en');
    this.addTranslation('lovely', 'Lovely', 'en');
    this.addTranslation('nice', 'Nice', 'en');
    this.addTranslation('sweet', 'Sweet', 'en');
    this.addTranslation('kind', 'Kind', 'en');
    this.addTranslation('gentle', 'Gentle', 'en');
    this.addTranslation('friendly', 'Friendly', 'en');
    this.addTranslation('warm', 'Warm', 'en');
    this.addTranslation('cool', 'Cool', 'en');
    this.addTranslation('hot', 'Hot', 'en');
    this.addTranslation('cold', 'Cold', 'en');
    this.addTranslation('warm', 'Warm', 'en');
    this.addTranslation('fresh', 'Fresh', 'en');
    this.addTranslation('new', 'New', 'en');
    this.addTranslation('old', 'Old', 'en');
    this.addTranslation('young', 'Young', 'en');
    this.addTranslation('mature', 'Mature', 'en');
    this.addTranslation('adult', 'Adult', 'en');
    this.addTranslation('child', 'Child', 'en');
    this.addTranslation('baby', 'Baby', 'en');
    this.addTranslation('teenager', 'Teenager', 'en');
    this.addTranslation('elderly', 'Elderly', 'en');
    this.addTranslation('senior', 'Senior', 'en');
    this.addTranslation('junior', 'Junior', 'en');
    this.addTranslation('beginner', 'Beginner', 'en');
    this.addTranslation('intermediate', 'Intermediate', 'en');
    this.addTranslation('advanced', 'Advanced', 'en');
    this.addTranslation('expert', 'Expert', 'en');
    this.addTranslation('professional', 'Professional', 'en');
    this.addTranslation('amateur', 'Amateur', 'en');
    this.addTranslation('novice', 'Novice', 'en');
    this.addTranslation('veteran', 'Veteran', 'en');
    this.addTranslation('rookie', 'Rookie', 'en');
    this.addTranslation('master', 'Master', 'en');
    this.addTranslation('student', 'Student', 'en');
    this.addTranslation('teacher', 'Teacher', 'en');
    this.addTranslation('instructor', 'Instructor', 'en');
    this.addTranslation('coach', 'Coach', 'en');
    this.addTranslation('mentor', 'Mentor', 'en');
    this.addTranslation('guide', 'Guide', 'en');
    this.addTranslation('leader', 'Leader', 'en');
    this.addTranslation('follower', 'Follower', 'en');
    this.addTranslation('supporter', 'Supporter', 'en');
    this.addTranslation('fan', 'Fan', 'en');
    this.addTranslation('lover', 'Lover', 'en');
    this.addTranslation('hater', 'Hater', 'en');
    this.addTranslation('enemy', 'Enemy', 'en');
    this.addTranslation('friend', 'Friend', 'en');
    this.addTranslation('buddy', 'Buddy', 'en');
    this.addTranslation('pal', 'Pal', 'en');
    this.addTranslation('mate', 'Mate', 'en');
    this.addTranslation('partner', 'Partner', 'en');
    this.addTranslation('colleague', 'Colleague', 'en');
    this.addTranslation('associate', 'Associate', 'en');
    this.addTranslation('companion', 'Companion', 'en');
    this.addTranslation('acquaintance', 'Acquaintance', 'en');
    this.addTranslation('stranger', 'Stranger', 'en');
    this.addTranslation('neighbor', 'Neighbor', 'en');
    this.addTranslation('citizen', 'Citizen', 'en');
    this.addTranslation('resident', 'Resident', 'en');
    this.addTranslation('visitor', 'Visitor', 'en');
    this.addTranslation('guest', 'Guest', 'en');
    this.addTranslation('host', 'Host', 'en');
    this.addTranslation('owner', 'Owner', 'en');
    this.addTranslation('manager', 'Manager', 'en');
    this.addTranslation('director', 'Director', 'en');
    this.addTranslation('executive', 'Executive', 'en');
    this.addTranslation('president', 'President', 'en');
    this.addTranslation('vice_president', 'Vice President', 'en');
    this.addTranslation('secretary', 'Secretary', 'en');
    this.addTranslation('treasurer', 'Treasurer', 'en');
    this.addTranslation('chairman', 'Chairman', 'en');
    this.addTranslation('ceo', 'CEO', 'en');
    this.addTranslation('cfo', 'CFO', 'en');
    this.addTranslation('cto', 'CTO', 'en');
    this.addTranslation('coo', 'COO', 'en');
    this.addTranslation('vp', 'VP', 'en');
    this.addTranslation('svp', 'SVP', 'en');
    this.addTranslation('evp', 'EVP', 'en');
    this.addTranslation('md', 'MD', 'en');
    this.addTranslation('gm', 'GM', 'en');
    this.addTranslation('pm', 'PM', 'en');
    this.addTranslation('hr', 'HR', 'en');
    this.addTranslation('it', 'IT', 'en');
    this.addTranslation('qa', 'QA', 'en');
    this.addTranslation('rd', 'R&D', 'en');
    this.addTranslation('sales', 'Sales', 'en');
    this.addTranslation('marketing', 'Marketing', 'en');
    this.addTranslation('finance', 'Finance', 'en');
    this.addTranslation('accounting', 'Accounting', 'en');
    this.addTranslation('legal', 'Legal', 'en');
    this.addTranslation('operations', 'Operations', 'en');
    this.addTranslation('production', 'Production', 'en');
    this.addTranslation('manufacturing', 'Manufacturing', 'en');
    this.addTranslation('distribution', 'Distribution', 'en');
    this.addTranslation('logistics', 'Logistics', 'en');
    this.addTranslation('supply_chain', 'Supply Chain', 'en');
    this.addTranslation('procurement', 'Procurement', 'en');
    this.addTranslation('purchasing', 'Purchasing', 'en');
    this.addTranslation('vendor', 'Vendor', 'en');
    this.addTranslation('supplier', 'Supplier', 'en');
    this.addTranslation('customer', 'Customer', 'en');
    this.addTranslation('client', 'Client', 'en');
    this.addTranslation('user', 'User', 'en');
    this.addTranslation('member', 'Member', 'en');
    this.addTranslation('subscriber', 'Subscriber', 'en');
    this.addTranslation('subscriber', 'Subscriber', 'en');

    // Twi translations
    this.addTranslation('app_name', 'Mint Trade', 'tw');
    this.addTranslation('app_tagline', 'Di Nkɔso. Di Nkɔso. Di Nkɔso.', 'tw');
    this.addTranslation('welcome', 'Akwaaba wɔ Mint Trade', 'tw');
    this.addTranslation('dashboard', 'Dashboard', 'tw');
    this.addTranslation('markets', 'Nkɔso', 'tw');
    this.addTranslation('portfolio', 'Portfolio', 'tw');
    this.addTranslation('wallet', 'Sika Kɔte', 'tw');
    this.addTranslation('social', 'Nkɔso', 'tw');
    this.addTranslation('learn', 'Sua', 'tw');
    this.addTranslation('profile', 'Profile', 'tw');
    this.addTranslation('notifications', 'Nkɔso', 'tw');
    this.addTranslation('settings', 'Nkɔso', 'tw');
    this.addTranslation('language', 'Kasa', 'tw');
    this.addTranslation('theme', 'Nkɔso', 'tw');
    this.addTranslation('logout', 'Fi', 'tw');
    this.addTranslation('login', 'Wura', 'tw');
    this.addTranslation('signup', 'Wura', 'tw');
    this.addTranslation('phone_number', 'Telefon Nɔma', 'tw');
    this.addTranslation('password', 'Password', 'tw');
    this.addTranslation('confirm_password', 'Confirm Password', 'tw');
    this.addTranslation('forgot_password', 'Wɔn Password?', 'tw');
    this.addTranslation('buy', 'Tɔ', 'tw');
    this.addTranslation('sell', 'Tɔn', 'tw');
    this.addTranslation('hold', 'Di', 'tw');
    this.addTranslation('price', 'Tɔn', 'tw');
    this.addTranslation('change', 'Sesa', 'tw');
    this.addTranslation('volume', 'Volume', 'tw');
    this.addTranslation('market_cap', 'Market Cap', 'tw');
    this.addTranslation('pe_ratio', 'P/E Ratio', 'tw');
    this.addTranslation('dividend', 'Dividend', 'tw');
    this.addTranslation('high', 'Soro', 'tw');
    this.addTranslation('low', 'Asi', 'tw');
    this.addTranslation('open', 'Bue', 'tw');
    this.addTranslation('close', 'To', 'tw');
    this.addTranslation('previous_close', 'Previous Close', 'tw');
    this.addTranslation('day_change', 'Da Sesa', 'tw');
    this.addTranslation('total_return', 'Total Return', 'tw');
    this.addTranslation('portfolio_value', 'Portfolio Value', 'tw');
    this.addTranslation('available_balance', 'Available Balance', 'tw');
    this.addTranslation('add_money', 'Fa Sika', 'tw');
    this.addTranslation('send_money', 'Soma Sika', 'tw');
    this.addTranslation('pay_bills', 'Pay Bills', 'tw');
    this.addTranslation('withdraw', 'Withdraw', 'tw');
    this.addTranslation('transactions', 'Transactions', 'tw');
    this.addTranslation('recent_activity', 'Recent Activity', 'tw');
    this.addTranslation('quick_actions', 'Quick Actions', 'tw');
    this.addTranslation('market_overview', 'Market Overview', 'tw');
    this.addTranslation('top_gainers', 'Top Gainers', 'tw');
    this.addTranslation('top_losers', 'Top Losers', 'tw');
    this.addTranslation('sectors', 'Sectors', 'tw');
    this.addTranslation('search', 'Hwehwɛ', 'tw');
    this.addTranslation('filter', 'Filter', 'tw');
    this.addTranslation('sort', 'Sort', 'tw');
    this.addTranslation('loading', 'Loading...', 'tw');
    this.addTranslation('error', 'Error', 'tw');
    this.addTranslation('success', 'Success', 'tw');
    this.addTranslation('warning', 'Warning', 'tw');
    this.addTranslation('info', 'Information', 'tw');
    this.addTranslation('confirm', 'Confirm', 'tw');
    this.addTranslation('cancel', 'Cancel', 'tw');
    this.addTranslation('save', 'Save', 'tw');
    this.addTranslation('delete', 'Delete', 'tw');
    this.addTranslation('edit', 'Edit', 'tw');
    this.addTranslation('share', 'Share', 'tw');
    this.addTranslation('copy', 'Copy', 'tw');
    this.addTranslation('refresh', 'Refresh', 'tw');
    this.addTranslation('retry', 'Retry', 'tw');
    this.addTranslation('done', 'Done', 'tw');
    this.addTranslation('next', 'Next', 'tw');
    this.addTranslation('previous', 'Previous', 'tw');
    this.addTranslation('skip', 'Skip', 'tw');
    this.addTranslation('continue', 'Continue', 'tw');
    this.addTranslation('back', 'Back', 'tw');
    this.addTranslation('close', 'Close', 'tw');
    this.addTranslation('open', 'Open', 'tw');
    this.addTranslation('view', 'View', 'tw');
    this.addTranslation('hide', 'Hide', 'tw');
    this.addTranslation('show', 'Show', 'tw');
    this.addTranslation('more', 'More', 'tw');
    this.addTranslation('less', 'Less', 'tw');
    this.addTranslation('all', 'All', 'tw');
    this.addTranslation('none', 'None', 'tw');
    this.addTranslation('select', 'Select', 'tw');
    this.addTranslation('deselect', 'Deselect', 'tw');
    this.addTranslation('choose', 'Choose', 'tw');
    this.addTranslation('pick', 'Pick', 'tw');
    this.addTranslation('enter', 'Enter', 'tw');
    this.addTranslation('type', 'Type', 'tw');
    this.addTranslation('input', 'Input', 'tw');
    this.addTranslation('output', 'Output', 'tw');
    this.addTranslation('result', 'Result', 'tw');
    this.addTranslation('data', 'Data', 'tw');
    this.addTranslation('information', 'Information', 'tw');
    this.addTranslation('details', 'Details', 'tw');
    this.addTranslation('summary', 'Summary', 'tw');
    this.addTranslation('overview', 'Overview', 'tw');
    this.addTranslation('analysis', 'Analysis', 'tw');
    this.addTranslation('report', 'Report', 'tw');
    this.addTranslation('chart', 'Chart', 'tw');
    this.addTranslation('graph', 'Graph', 'tw');
    this.addTranslation('table', 'Table', 'tw');
    this.addTranslation('list', 'List', 'tw');
    this.addTranslation('grid', 'Grid', 'tw');
    this.addTranslation('card', 'Card', 'tw');
    this.addTranslation('item', 'Item', 'tw');
    this.addTranslation('items', 'Items', 'tw');
    this.addTranslation('count', 'Count', 'tw');
    this.addTranslation('total', 'Total', 'tw');
    this.addTranslation('average', 'Average', 'tw');
    this.addTranslation('maximum', 'Maximum', 'tw');
    this.addTranslation('minimum', 'Minimum', 'tw');
    this.addTranslation('range', 'Range', 'tw');
    this.addTranslation('percentage', 'Percentage', 'tw');
    this.addTranslation('ratio', 'Ratio', 'tw');
    this.addTranslation('rate', 'Rate', 'tw');
    this.addTranslation('amount', 'Amount', 'tw');
    this.addTranslation('quantity', 'Quantity', 'tw');
    this.addTranslation('value', 'Value', 'tw');
    this.addTranslation('worth', 'Worth', 'tw');
    this.addTranslation('cost', 'Cost', 'tw');
    this.addTranslation('price', 'Price', 'tw');
    this.addTranslation('fee', 'Fee', 'tw');
    this.addTranslation('charge', 'Charge', 'tw');
    this.addTranslation('tax', 'Tax', 'tw');
    this.addTranslation('discount', 'Discount', 'tw');
    this.addTranslation('bonus', 'Bonus', 'tw');
    this.addTranslation('reward', 'Reward', 'tw');
    this.addTranslation('benefit', 'Benefit', 'tw');
    this.addTranslation('advantage', 'Advantage', 'tw');
    this.addTranslation('disadvantage', 'Disadvantage', 'tw');
    this.addTranslation('pros', 'Pros', 'tw');
    this.addTranslation('cons', 'Cons', 'tw');
    this.addTranslation('positive', 'Positive', 'tw');
    this.addTranslation('negative', 'Negative', 'tw');
    this.addTranslation('neutral', 'Neutral', 'tw');
    this.addTranslation('good', 'Good', 'tw');
    this.addTranslation('bad', 'Bad', 'tw');
    this.addTranslation('excellent', 'Excellent', 'tw');
    this.addTranslation('poor', 'Poor', 'tw');
    this.addTranslation('great', 'Great', 'tw');
    this.addTranslation('terrible', 'Terrible', 'tw');
    this.addTranslation('amazing', 'Amazing', 'tw');
    this.addTranslation('awful', 'Awful', 'tw');
    this.addTranslation('wonderful', 'Wonderful', 'tw');
    this.addTranslation('horrible', 'Horrible', 'tw');
    this.addTranslation('fantastic', 'Fantastic', 'tw');
    this.addTranslation('disgusting', 'Disgusting', 'tw');
    this.addTranslation('beautiful', 'Beautiful', 'tw');
    this.addTranslation('ugly', 'Ugly', 'tw');
    this.addTranslation('pretty', 'Pretty', 'tw');
    this.addTranslation('handsome', 'Handsome', 'tw');
    this.addTranslation('cute', 'Cute', 'tw');
    this.addTranslation('lovely', 'Lovely', 'tw');
    this.addTranslation('nice', 'Nice', 'tw');
    this.addTranslation('sweet', 'Sweet', 'tw');
    this.addTranslation('kind', 'Kind', 'tw');
    this.addTranslation('gentle', 'Gentle', 'tw');
    this.addTranslation('friendly', 'Friendly', 'tw');
    this.addTranslation('warm', 'Warm', 'tw');
    this.addTranslation('cool', 'Cool', 'tw');
    this.addTranslation('hot', 'Hot', 'tw');
    this.addTranslation('cold', 'Cold', 'tw');
    this.addTranslation('warm', 'Warm', 'tw');
    this.addTranslation('fresh', 'Fresh', 'tw');
    this.addTranslation('new', 'New', 'tw');
    this.addTranslation('old', 'Old', 'tw');
    this.addTranslation('young', 'Young', 'tw');
    this.addTranslation('mature', 'Mature', 'tw');
    this.addTranslation('adult', 'Adult', 'tw');
    this.addTranslation('child', 'Child', 'tw');
    this.addTranslation('baby', 'Baby', 'tw');
    this.addTranslation('teenager', 'Teenager', 'tw');
    this.addTranslation('elderly', 'Elderly', 'tw');
    this.addTranslation('senior', 'Senior', 'tw');
    this.addTranslation('junior', 'Junior', 'tw');
    this.addTranslation('beginner', 'Beginner', 'tw');
    this.addTranslation('intermediate', 'Intermediate', 'tw');
    this.addTranslation('advanced', 'Advanced', 'tw');
    this.addTranslation('expert', 'Expert', 'tw');
    this.addTranslation('professional', 'Professional', 'tw');
    this.addTranslation('amateur', 'Amateur', 'tw');
    this.addTranslation('novice', 'Novice', 'tw');
    this.addTranslation('veteran', 'Veteran', 'tw');
    this.addTranslation('rookie', 'Rookie', 'tw');
    this.addTranslation('master', 'Master', 'tw');
    this.addTranslation('student', 'Student', 'tw');
    this.addTranslation('teacher', 'Teacher', 'tw');
    this.addTranslation('instructor', 'Instructor', 'tw');
    this.addTranslation('coach', 'Coach', 'tw');
    this.addTranslation('mentor', 'Mentor', 'tw');
    this.addTranslation('guide', 'Guide', 'tw');
    this.addTranslation('leader', 'Leader', 'tw');
    this.addTranslation('follower', 'Follower', 'tw');
    this.addTranslation('supporter', 'Supporter', 'tw');
    this.addTranslation('fan', 'Fan', 'tw');
    this.addTranslation('lover', 'Lover', 'tw');
    this.addTranslation('hater', 'Hater', 'tw');
    this.addTranslation('enemy', 'Enemy', 'tw');
    this.addTranslation('friend', 'Friend', 'tw');
    this.addTranslation('buddy', 'Buddy', 'tw');
    this.addTranslation('pal', 'Pal', 'tw');
    this.addTranslation('mate', 'Mate', 'tw');
    this.addTranslation('partner', 'Partner', 'tw');
    this.addTranslation('colleague', 'Colleague', 'tw');
    this.addTranslation('associate', 'Associate', 'tw');
    this.addTranslation('companion', 'Companion', 'tw');
    this.addTranslation('acquaintance', 'Acquaintance', 'tw');
    this.addTranslation('stranger', 'Stranger', 'tw');
    this.addTranslation('neighbor', 'Neighbor', 'tw');
    this.addTranslation('citizen', 'Citizen', 'tw');
    this.addTranslation('resident', 'Resident', 'tw');
    this.addTranslation('visitor', 'Visitor', 'tw');
    this.addTranslation('guest', 'Guest', 'tw');
    this.addTranslation('host', 'Host', 'tw');
    this.addTranslation('owner', 'Owner', 'tw');
    this.addTranslation('manager', 'Manager', 'tw');
    this.addTranslation('director', 'Director', 'tw');
    this.addTranslation('executive', 'Executive', 'tw');
    this.addTranslation('president', 'President', 'tw');
    this.addTranslation('vice_president', 'Vice President', 'tw');
    this.addTranslation('secretary', 'Secretary', 'tw');
    this.addTranslation('treasurer', 'Treasurer', 'tw');
    this.addTranslation('chairman', 'Chairman', 'tw');
    this.addTranslation('ceo', 'CEO', 'tw');
    this.addTranslation('cfo', 'CFO', 'tw');
    this.addTranslation('cto', 'CTO', 'tw');
    this.addTranslation('coo', 'COO', 'tw');
    this.addTranslation('vp', 'VP', 'tw');
    this.addTranslation('svp', 'SVP', 'tw');
    this.addTranslation('evp', 'EVP', 'tw');
    this.addTranslation('md', 'MD', 'tw');
    this.addTranslation('gm', 'GM', 'tw');
    this.addTranslation('pm', 'PM', 'tw');
    this.addTranslation('hr', 'HR', 'tw');
    this.addTranslation('it', 'IT', 'tw');
    this.addTranslation('qa', 'QA', 'tw');
    this.addTranslation('rd', 'R&D', 'tw');
    this.addTranslation('sales', 'Sales', 'tw');
    this.addTranslation('marketing', 'Marketing', 'tw');
    this.addTranslation('finance', 'Finance', 'tw');
    this.addTranslation('accounting', 'Accounting', 'tw');
    this.addTranslation('legal', 'Legal', 'tw');
    this.addTranslation('operations', 'Operations', 'tw');
    this.addTranslation('production', 'Production', 'tw');
    this.addTranslation('manufacturing', 'Manufacturing', 'tw');
    this.addTranslation('distribution', 'Distribution', 'tw');
    this.addTranslation('logistics', 'Logistics', 'tw');
    this.addTranslation('supply_chain', 'Supply Chain', 'tw');
    this.addTranslation('procurement', 'Procurement', 'tw');
    this.addTranslation('purchasing', 'Purchasing', 'tw');
    this.addTranslation('vendor', 'Vendor', 'tw');
    this.addTranslation('supplier', 'Supplier', 'tw');
    this.addTranslation('customer', 'Customer', 'tw');
    this.addTranslation('client', 'Client', 'tw');
    this.addTranslation('user', 'User', 'tw');
    this.addTranslation('member', 'Member', 'tw');
    this.addTranslation('subscriber', 'Subscriber', 'tw');

    // French translations
    this.addTranslation('app_name', 'Mint Trade', 'fr');
    this.addTranslation('app_tagline', 'Investissez Intelligent. Tradez Local. Grandissez Global.', 'fr');
    this.addTranslation('welcome', 'Bienvenue sur Mint Trade', 'fr');
    this.addTranslation('dashboard', 'Tableau de bord', 'fr');
    this.addTranslation('markets', 'Marchés', 'fr');
    this.addTranslation('portfolio', 'Portfolio', 'fr');
    this.addTranslation('wallet', 'Portefeuille', 'fr');
    this.addTranslation('social', 'Social', 'fr');
    this.addTranslation('learn', 'Apprendre', 'fr');
    this.addTranslation('profile', 'Profil', 'fr');
    this.addTranslation('notifications', 'Notifications', 'fr');
    this.addTranslation('settings', 'Paramètres', 'fr');
    this.addTranslation('language', 'Langue', 'fr');
    this.addTranslation('theme', 'Thème', 'fr');
    this.addTranslation('logout', 'Déconnexion', 'fr');
    this.addTranslation('login', 'Connexion', 'fr');
    this.addTranslation('signup', 'Inscription', 'fr');
    this.addTranslation('phone_number', 'Numéro de téléphone', 'fr');
    this.addTranslation('password', 'Mot de passe', 'fr');
    this.addTranslation('confirm_password', 'Confirmer le mot de passe', 'fr');
    this.addTranslation('forgot_password', 'Mot de passe oublié?', 'fr');
    this.addTranslation('buy', 'Acheter', 'fr');
    this.addTranslation('sell', 'Vendre', 'fr');
    this.addTranslation('hold', 'Tenir', 'fr');
    this.addTranslation('price', 'Prix', 'fr');
    this.addTranslation('change', 'Changement', 'fr');
    this.addTranslation('volume', 'Volume', 'fr');
    this.addTranslation('market_cap', 'Capitalisation boursière', 'fr');
    this.addTranslation('pe_ratio', 'Ratio P/E', 'fr');
    this.addTranslation('dividend', 'Dividende', 'fr');
    this.addTranslation('high', 'Haut', 'fr');
    this.addTranslation('low', 'Bas', 'fr');
    this.addTranslation('open', 'Ouvrir', 'fr');
    this.addTranslation('close', 'Fermer', 'fr');
    this.addTranslation('previous_close', 'Fermeture précédente', 'fr');
    this.addTranslation('day_change', 'Changement du jour', 'fr');
    this.addTranslation('total_return', 'Rendement total', 'fr');
    this.addTranslation('portfolio_value', 'Valeur du portfolio', 'fr');
    this.addTranslation('available_balance', 'Solde disponible', 'fr');
    this.addTranslation('add_money', 'Ajouter de l\'argent', 'fr');
    this.addTranslation('send_money', 'Envoyer de l\'argent', 'fr');
    this.addTranslation('pay_bills', 'Payer les factures', 'fr');
    this.addTranslation('withdraw', 'Retirer', 'fr');
    this.addTranslation('transactions', 'Transactions', 'fr');
    this.addTranslation('recent_activity', 'Activité récente', 'fr');
    this.addTranslation('quick_actions', 'Actions rapides', 'fr');
    this.addTranslation('market_overview', 'Aperçu du marché', 'fr');
    this.addTranslation('top_gainers', 'Top Gagnants', 'fr');
    this.addTranslation('top_losers', 'Top Perdants', 'fr');
    this.addTranslation('sectors', 'Secteurs', 'fr');
    this.addTranslation('search', 'Rechercher', 'fr');
    this.addTranslation('filter', 'Filtrer', 'fr');
    this.addTranslation('sort', 'Trier', 'fr');
    this.addTranslation('loading', 'Chargement...', 'fr');
    this.addTranslation('error', 'Erreur', 'fr');
    this.addTranslation('success', 'Succès', 'fr');
    this.addTranslation('warning', 'Avertissement', 'fr');
    this.addTranslation('info', 'Information', 'fr');
    this.addTranslation('confirm', 'Confirmer', 'fr');
    this.addTranslation('cancel', 'Annuler', 'fr');
    this.addTranslation('save', 'Sauvegarder', 'fr');
    this.addTranslation('delete', 'Supprimer', 'fr');
    this.addTranslation('edit', 'Modifier', 'fr');
    this.addTranslation('share', 'Partager', 'fr');
    this.addTranslation('copy', 'Copier', 'fr');
    this.addTranslation('refresh', 'Actualiser', 'fr');
    this.addTranslation('retry', 'Réessayer', 'fr');
    this.addTranslation('done', 'Terminé', 'fr');
    this.addTranslation('next', 'Suivant', 'fr');
    this.addTranslation('previous', 'Précédent', 'fr');
    this.addTranslation('skip', 'Ignorer', 'fr');
    this.addTranslation('continue', 'Continuer', 'fr');
    this.addTranslation('back', 'Retour', 'fr');
    this.addTranslation('close', 'Fermer', 'fr');
    this.addTranslation('open', 'Ouvrir', 'fr');
    this.addTranslation('view', 'Voir', 'fr');
    this.addTranslation('hide', 'Masquer', 'fr');
    this.addTranslation('show', 'Afficher', 'fr');
    this.addTranslation('more', 'Plus', 'fr');
    this.addTranslation('less', 'Moins', 'fr');
    this.addTranslation('all', 'Tout', 'fr');
    this.addTranslation('none', 'Aucun', 'fr');
    this.addTranslation('select', 'Sélectionner', 'fr');
    this.addTranslation('deselect', 'Désélectionner', 'fr');
    this.addTranslation('choose', 'Choisir', 'fr');
    this.addTranslation('pick', 'Choisir', 'fr');
    this.addTranslation('enter', 'Entrer', 'fr');
    this.addTranslation('type', 'Taper', 'fr');
    this.addTranslation('input', 'Entrée', 'fr');
    this.addTranslation('output', 'Sortie', 'fr');
    this.addTranslation('result', 'Résultat', 'fr');
    this.addTranslation('data', 'Données', 'fr');
    this.addTranslation('information', 'Information', 'fr');
    this.addTranslation('details', 'Détails', 'fr');
    this.addTranslation('summary', 'Résumé', 'fr');
    this.addTranslation('overview', 'Aperçu', 'fr');
    this.addTranslation('analysis', 'Analyse', 'fr');
    this.addTranslation('report', 'Rapport', 'fr');
    this.addTranslation('chart', 'Graphique', 'fr');
    this.addTranslation('graph', 'Graphique', 'fr');
    this.addTranslation('table', 'Tableau', 'fr');
    this.addTranslation('list', 'Liste', 'fr');
    this.addTranslation('grid', 'Grille', 'fr');
    this.addTranslation('card', 'Carte', 'fr');
    this.addTranslation('item', 'Élément', 'fr');
    this.addTranslation('items', 'Éléments', 'fr');
    this.addTranslation('count', 'Compter', 'fr');
    this.addTranslation('total', 'Total', 'fr');
    this.addTranslation('average', 'Moyenne', 'fr');
    this.addTranslation('maximum', 'Maximum', 'fr');
    this.addTranslation('minimum', 'Minimum', 'fr');
    this.addTranslation('range', 'Plage', 'fr');
    this.addTranslation('percentage', 'Pourcentage', 'fr');
    this.addTranslation('ratio', 'Ratio', 'fr');
    this.addTranslation('rate', 'Taux', 'fr');
    this.addTranslation('amount', 'Montant', 'fr');
    this.addTranslation('quantity', 'Quantité', 'fr');
    this.addTranslation('value', 'Valeur', 'fr');
    this.addTranslation('worth', 'Valeur', 'fr');
    this.addTranslation('cost', 'Coût', 'fr');
    this.addTranslation('price', 'Prix', 'fr');
    this.addTranslation('fee', 'Frais', 'fr');
    this.addTranslation('charge', 'Charge', 'fr');
    this.addTranslation('tax', 'Taxe', 'fr');
    this.addTranslation('discount', 'Remise', 'fr');
    this.addTranslation('bonus', 'Bonus', 'fr');
    this.addTranslation('reward', 'Récompense', 'fr');
    this.addTranslation('benefit', 'Avantage', 'fr');
    this.addTranslation('advantage', 'Avantage', 'fr');
    this.addTranslation('disadvantage', 'Inconvénient', 'fr');
    this.addTranslation('pros', 'Avantages', 'fr');
    this.addTranslation('cons', 'Inconvénients', 'fr');
    this.addTranslation('positive', 'Positif', 'fr');
    this.addTranslation('negative', 'Négatif', 'fr');
    this.addTranslation('neutral', 'Neutre', 'fr');
    this.addTranslation('good', 'Bon', 'fr');
    this.addTranslation('bad', 'Mauvais', 'fr');
    this.addTranslation('excellent', 'Excellent', 'fr');
    this.addTranslation('poor', 'Pauvre', 'fr');
    this.addTranslation('great', 'Génial', 'fr');
    this.addTranslation('terrible', 'Terrible', 'fr');
    this.addTranslation('amazing', 'Incroyable', 'fr');
    this.addTranslation('awful', 'Affreux', 'fr');
    this.addTranslation('wonderful', 'Merveilleux', 'fr');
    this.addTranslation('horrible', 'Horrible', 'fr');
    this.addTranslation('fantastic', 'Fantastique', 'fr');
    this.addTranslation('disgusting', 'Dégoûtant', 'fr');
    this.addTranslation('beautiful', 'Beau', 'fr');
    this.addTranslation('ugly', 'Laid', 'fr');
    this.addTranslation('pretty', 'Joli', 'fr');
    this.addTranslation('handsome', 'Beau', 'fr');
    this.addTranslation('cute', 'Mignon', 'fr');
    this.addTranslation('lovely', 'Adorable', 'fr');
    this.addTranslation('nice', 'Gentil', 'fr');
    this.addTranslation('sweet', 'Doux', 'fr');
    this.addTranslation('kind', 'Gentil', 'fr');
    this.addTranslation('gentle', 'Doux', 'fr');
    this.addTranslation('friendly', 'Aimable', 'fr');
    this.addTranslation('warm', 'Chaud', 'fr');
    this.addTranslation('cool', 'Cool', 'fr');
    this.addTranslation('hot', 'Chaud', 'fr');
    this.addTranslation('cold', 'Froid', 'fr');
    this.addTranslation('warm', 'Chaud', 'fr');
    this.addTranslation('fresh', 'Frais', 'fr');
    this.addTranslation('new', 'Nouveau', 'fr');
    this.addTranslation('old', 'Vieux', 'fr');
    this.addTranslation('young', 'Jeune', 'fr');
    this.addTranslation('mature', 'Mûr', 'fr');
    this.addTranslation('adult', 'Adulte', 'fr');
    this.addTranslation('child', 'Enfant', 'fr');
    this.addTranslation('baby', 'Bébé', 'fr');
    this.addTranslation('teenager', 'Adolescent', 'fr');
    this.addTranslation('elderly', 'Âgé', 'fr');
    this.addTranslation('senior', 'Senior', 'fr');
    this.addTranslation('junior', 'Junior', 'fr');
    this.addTranslation('beginner', 'Débutant', 'fr');
    this.addTranslation('intermediate', 'Intermédiaire', 'fr');
    this.addTranslation('advanced', 'Avancé', 'fr');
    this.addTranslation('expert', 'Expert', 'fr');
    this.addTranslation('professional', 'Professionnel', 'fr');
    this.addTranslation('amateur', 'Amateur', 'fr');
    this.addTranslation('novice', 'Novice', 'fr');
    this.addTranslation('veteran', 'Vétéran', 'fr');
    this.addTranslation('rookie', 'Rookie', 'fr');
    this.addTranslation('master', 'Maître', 'fr');
    this.addTranslation('student', 'Étudiant', 'fr');
    this.addTranslation('teacher', 'Enseignant', 'fr');
    this.addTranslation('instructor', 'Instructeur', 'fr');
    this.addTranslation('coach', 'Entraîneur', 'fr');
    this.addTranslation('mentor', 'Mentor', 'fr');
    this.addTranslation('guide', 'Guide', 'fr');
    this.addTranslation('leader', 'Leader', 'fr');
    this.addTranslation('follower', 'Suiveur', 'fr');
    this.addTranslation('supporter', 'Supporter', 'fr');
    this.addTranslation('fan', 'Fan', 'fr');
    this.addTranslation('lover', 'Amoureux', 'fr');
    this.addTranslation('hater', 'Haineux', 'fr');
    this.addTranslation('enemy', 'Ennemi', 'fr');
    this.addTranslation('friend', 'Ami', 'fr');
    this.addTranslation('buddy', 'Copain', 'fr');
    this.addTranslation('pal', 'Pote', 'fr');
    this.addTranslation('mate', 'Compagnon', 'fr');
    this.addTranslation('partner', 'Partenaire', 'fr');
    this.addTranslation('colleague', 'Collègue', 'fr');
    this.addTranslation('associate', 'Associé', 'fr');
    this.addTranslation('companion', 'Compagnon', 'fr');
    this.addTranslation('acquaintance', 'Connaissance', 'fr');
    this.addTranslation('stranger', 'Étranger', 'fr');
    this.addTranslation('neighbor', 'Voisin', 'fr');
    this.addTranslation('citizen', 'Citoyen', 'fr');
    this.addTranslation('resident', 'Résident', 'fr');
    this.addTranslation('visitor', 'Visiteur', 'fr');
    this.addTranslation('guest', 'Invité', 'fr');
    this.addTranslation('host', 'Hôte', 'fr');
    this.addTranslation('owner', 'Propriétaire', 'fr');
    this.addTranslation('manager', 'Gestionnaire', 'fr');
    this.addTranslation('director', 'Directeur', 'fr');
    this.addTranslation('executive', 'Exécutif', 'fr');
    this.addTranslation('president', 'Président', 'fr');
    this.addTranslation('vice_president', 'Vice-président', 'fr');
    this.addTranslation('secretary', 'Secrétaire', 'fr');
    this.addTranslation('treasurer', 'Trésorier', 'fr');
    this.addTranslation('chairman', 'Président', 'fr');
    this.addTranslation('ceo', 'PDG', 'fr');
    this.addTranslation('cfo', 'CFO', 'fr');
    this.addTranslation('cto', 'CTO', 'fr');
    this.addTranslation('coo', 'COO', 'fr');
    this.addTranslation('vp', 'VP', 'fr');
    this.addTranslation('svp', 'SVP', 'fr');
    this.addTranslation('evp', 'EVP', 'fr');
    this.addTranslation('md', 'MD', 'fr');
    this.addTranslation('gm', 'GM', 'fr');
    this.addTranslation('pm', 'PM', 'fr');
    this.addTranslation('hr', 'RH', 'fr');
    this.addTranslation('it', 'IT', 'fr');
    this.addTranslation('qa', 'QA', 'fr');
    this.addTranslation('rd', 'R&D', 'fr');
    this.addTranslation('sales', 'Ventes', 'fr');
    this.addTranslation('marketing', 'Marketing', 'fr');
    this.addTranslation('finance', 'Finance', 'fr');
    this.addTranslation('accounting', 'Comptabilité', 'fr');
    this.addTranslation('legal', 'Légal', 'fr');
    this.addTranslation('operations', 'Opérations', 'fr');
    this.addTranslation('production', 'Production', 'fr');
    this.addTranslation('manufacturing', 'Fabrication', 'fr');
    this.addTranslation('distribution', 'Distribution', 'fr');
    this.addTranslation('logistics', 'Logistique', 'fr');
    this.addTranslation('supply_chain', 'Chaîne d\'approvisionnement', 'fr');
    this.addTranslation('procurement', 'Approvisionnement', 'fr');
    this.addTranslation('purchasing', 'Achat', 'fr');
    this.addTranslation('vendor', 'Vendeur', 'fr');
    this.addTranslation('supplier', 'Fournisseur', 'fr');
    this.addTranslation('customer', 'Client', 'fr');
    this.addTranslation('client', 'Client', 'fr');
    this.addTranslation('user', 'Utilisateur', 'fr');
    this.addTranslation('member', 'Membre', 'fr');
    this.addTranslation('subscriber', 'Abonné', 'fr');
  }

  // Add translation
  private addTranslation(key: string, value: string, language: string) {
    const translation: Translation = {
      key,
      value,
      language,
    };
    this.translations.set(`${key}_${language}`, translation);
  }

  // Get translation
  getTranslation(key: string, language?: string): string {
    const lang = language || this.currentLanguage;
    const translation = this.translations.get(`${key}_${lang}`);
    return translation?.value || key;
  }

  // Get current language
  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  // Set current language
  async setCurrentLanguage(language: string): Promise<void> {
    this.currentLanguage = language;
    await AsyncStorage.setItem('selected_language', language);
  }

  // Get supported languages
  getSupportedLanguages(): Language[] {
    return SUPPORTED_LANGUAGES;
  }

  // Get language by code
  getLanguageByCode(code: string): Language | undefined {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
  }

  // Get default language
  getDefaultLanguage(): string {
    return DEFAULT_LANGUAGE;
  }

  // Load saved language
  async loadSavedLanguage(): Promise<void> {
    try {
      const savedLanguage = await AsyncStorage.getItem('selected_language');
      if (savedLanguage) {
        this.currentLanguage = savedLanguage;
      }
    } catch (error) {
      console.error('Error loading saved language:', error);
    }
  }

  // Get localized string
  getLocalizedString(key: string, language?: string): string {
    return this.getTranslation(key, language);
  }

  // Get localized string with fallback
  getLocalizedStringWithFallback(key: string, language?: string, fallback?: string): string {
    const translation = this.getTranslation(key, language);
    if (translation === key && fallback) {
      return fallback;
    }
    return translation;
  }

  // Format currency based on language
  formatCurrency(amount: number, language?: string): string {
    const lang = language || this.currentLanguage;
    
    switch (lang) {
      case 'en':
        return `₵${amount.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;
      case 'tw':
        return `₵${amount.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;
      case 'fr':
        return `${amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} ₵`;
      default:
        return `₵${amount.toFixed(2)}`;
    }
  }

  // Format date based on language
  formatDate(date: Date, language?: string): string {
    const lang = language || this.currentLanguage;
    
    switch (lang) {
      case 'en':
        return date.toLocaleDateString('en-GB');
      case 'tw':
        return date.toLocaleDateString('en-GB');
      case 'fr':
        return date.toLocaleDateString('fr-FR');
      default:
        return date.toLocaleDateString();
    }
  }

  // Format number based on language
  formatNumber(number: number, language?: string): string {
    const lang = language || this.currentLanguage;
    
    switch (lang) {
      case 'en':
        return number.toLocaleString('en-GH');
      case 'tw':
        return number.toLocaleString('en-GH');
      case 'fr':
        return number.toLocaleString('fr-FR');
      default:
        return number.toLocaleString();
    }
  }

  // Get RTL status
  isRTL(language?: string): boolean {
    const lang = language || this.currentLanguage;
    const languageObj = this.getLanguageByCode(lang);
    return languageObj?.rtl || false;
  }

  // Get language direction
  getLanguageDirection(language?: string): 'ltr' | 'rtl' {
    return this.isRTL(language) ? 'rtl' : 'ltr';
  }
}