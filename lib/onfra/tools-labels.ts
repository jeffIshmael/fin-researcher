import { humanize } from "@/lib/utils";

const LABELS: Record<string, string> = {
  analyze_wallet: "Analyzing wallet",
  get_cash_flow_summary: "Checking cash flow",
  get_token_balances: "Checking token balances",
  get_token_breakdown: "Reviewing token activity",
  compare_periods: "Comparing periods",
  get_spending_breakdown: "Breaking down spending",
  get_dominant_counterparties: "Finding top counterparties",
  get_wallet_activity: "Reviewing wallet activity",
  generate_transaction_statement: "Generating statement",
  explain_transaction: "Explaining transaction",
};

const CARD_TITLES: Record<string, string> = {
  analyze_wallet: "Wallet profile",
  get_cash_flow_summary: "Cash flow",
  get_token_balances: "Token balances",
  get_token_breakdown: "Token breakdown",
  compare_periods: "Period comparison",
  get_spending_breakdown: "Spending breakdown",
  get_dominant_counterparties: "Top counterparties",
  get_wallet_activity: "Wallet activity",
  generate_transaction_statement: "Statement",
  explain_transaction: "Transaction explanation",
};

export const toolLabel = (name: string) => LABELS[name] ?? humanize(name);
export const cardTitle = (name: string) => CARD_TITLES[name] ?? humanize(name);
