export const checkoutCurrency = "EUR" as const;

export function getBankTransferDetails() {
  return {
    accountHolder: process.env.BANK_TRANSFER_ACCOUNT_HOLDER ?? "FERRUM Demo Store",
    bankName: process.env.BANK_TRANSFER_BANK_NAME ?? "Demo Bank (test details)",
    iban: process.env.BANK_TRANSFER_IBAN ?? "DE00 0000 0000 0000 0000 00",
    bic: process.env.BANK_TRANSFER_BIC ?? "TESTDE00XXX",
  };
}
