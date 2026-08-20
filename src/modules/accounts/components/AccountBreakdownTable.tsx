// src/modules/accounts/components/AccountBreakdownTable.tsx

import React from "react";
import { Landmark } from "lucide-react";
import { AccountBreakdownItem } from "../types/accounts.types";

const formatINR = (val: number | undefined | null) => {
  if (val === undefined || val === null) return "₹0";
  const formatted = Math.abs(val).toLocaleString("en-IN");
  return val < 0 ? `-₹${formatted}` : `₹${formatted}`;
};

interface Props {
  accounts: AccountBreakdownItem[];
}

export const AccountBreakdownTable: React.FC<Props> = ({ accounts }) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm h-full flex flex-col">
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Landmark className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-800">Account Breakdown</h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">{accounts.length} Accounts</span>
      </div>

      {accounts.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-sm my-auto">
          No account data available for this period.
        </div>
      ) : (
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Account</th>
                <th className="px-4 py-3 text-right">Collection</th>
                <th className="px-4 py-3 text-right">Expense</th>
                <th className="px-4 py-3 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {accounts.map((acc) => {
                const isNeg = acc.current_balance < 0;
                return (
                  <tr key={acc.account_id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-slate-800">{acc.account_name}</td>
                    <td className="px-4 py-3.5 text-right font-medium text-emerald-600">
                      {formatINR(acc.today_collection)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-slate-600">
                      {formatINR(acc.today_expense)}
                    </td>
                    <td className={`px-4 py-3.5 text-right font-semibold ${isNeg ? "text-rose-600" : "text-slate-900"}`}>
                      {formatINR(acc.current_balance)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};