'use client';

import React, { useState, useMemo } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { 
  ShieldCheck, 
  Search, 
  Clock, 
  FileText, 
  Filter, 
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export function AuditLogTab() {
  const { auditLogs, isLoadingAuditLogs } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [targetFilter, setTargetFilter] = useState<string>('all');

  const filteredLogs = useMemo(() => {
    return (auditLogs || []).filter(log => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const action = (log.action || '').toLowerCase();
        const email = (log.adminEmail || '').toLowerCase();
        const desc = (log.description || '').toLowerCase();
        const targetId = (log.targetId || '').toLowerCase();
        if (!action.includes(q) && !email.includes(q) && !desc.includes(q) && !targetId.includes(q)) return false;
      }
      if (targetFilter !== 'all') {
        if (log.targetType !== targetFilter) return false;
      }
      return true;
    });
  }, [auditLogs, searchQuery, targetFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white border border-[#E6E4E0] rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[#111111]">Platform Security &amp; Audit Trail</h2>
            <p className="text-xs text-neutral-500">
              Immutable chronological record of administrator operations, status mutations, and financial verifications.
            </p>
          </div>
          <div className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#F7F6F3] border border-[#E6E4E0] text-neutral-700 self-start sm:self-auto">
            {filteredLogs.length} {filteredLogs.length === 1 ? 'Log' : 'Logs'} recorded
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search admin email, action, target ID, or description..."
              className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl border border-[#E6E4E0] bg-[#F7F6F3] focus:bg-white focus:outline-none focus:border-black transition-colors"
            />
          </div>

          <div>
            <select
              value={targetFilter}
              onChange={(e) => setTargetFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E6E4E0] bg-[#F7F6F3] focus:bg-white focus:outline-none font-medium text-neutral-800"
            >
              <option value="all">All Operational Targets</option>
              <option value="order">Orders</option>
              <option value="reseller">Reseller Stores</option>
              <option value="customer">Customers</option>
              <option value="withdrawal">Withdrawals</option>
              <option value="subscription">Subscriptions</option>
              <option value="product">Products</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white border border-[#E6E4E0] rounded-2xl shadow-xs overflow-hidden">
        {isLoadingAuditLogs ? (
          <div className="py-16 text-center text-xs text-neutral-500">
            Loading audit log trail from Firestore...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <ShieldCheck className="w-8 h-8 text-neutral-300 mx-auto" />
            <p className="text-xs font-semibold text-neutral-700">No audit log entries recorded yet</p>
            <p className="text-[11px] text-neutral-500 max-w-sm mx-auto">
              Whenever an administrator updates an order, verifies a subscription, or modifies a customer status, an immutable entry is recorded here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F6F3] border-b border-[#E6E4E0] text-neutral-600 font-semibold">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Admin Email</th>
                  <th className="py-3 px-4">Target Type &amp; ID</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAF9F5] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-600 whitespace-nowrap">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-neutral-900">{log.adminEmail}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">UID: {log.adminUid?.substring(0, 10)}...</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[10px] uppercase font-bold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded mr-1.5">
                        {log.targetType}
                      </span>
                      <span className="font-mono text-[11px] text-neutral-800 select-all">
                        {log.targetId}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-900 text-white">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-neutral-700 leading-relaxed max-w-md">
                      {log.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
