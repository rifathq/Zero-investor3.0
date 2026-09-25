'use client';

import React, { useState, useMemo } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { CustomerRecord } from '@/types/admin';
import { formatBDT } from '@/lib/formatters';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  Mail, 
  Phone, 
  CheckCircle2, 
  XCircle,
  X,
  UserCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { AdminPageHeader } from '../common/AdminPageHeader';
import { StatusBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';

export function CustomersTab() {
  const { customers, isLoadingCustomers, updateCustomerStatus, isSubmitting } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  const filteredCustomers = useMemo(() => {
    return (customers || []).filter(cust => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = (cust.displayName || '').toLowerCase();
        const email = (cust.email || '').toLowerCase();
        const phone = (cust.phone || '').toLowerCase();
        const uid = (cust.firebaseUid || cust.id || '').toLowerCase();
        if (!name.includes(q) && !email.includes(q) && !phone.includes(q) && !uid.includes(q)) return false;
      }
      if (statusFilter !== 'all') {
        if (cust.status !== statusFilter) return false;
      }
      return true;
    });
  }, [customers, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / itemsPerPage));
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(start, start + itemsPerPage);
  }, [filteredCustomers, currentPage, itemsPerPage]);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const next = currentStatus === 'suspended' ? 'active' : 'suspended';
    await updateCustomerStatus(id, next as any);
  };

  const activeCount = (customers || []).filter(c => c.status === 'active').length;
  const suspendedCount = (customers || []).filter(c => c.status === 'suspended').length;
  const totalSpentAll = (customers || []).reduce((sum, c) => sum + (c.totalSpentBDT || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <AdminPageHeader
        title="Customer Directory &amp; Accounts"
        description="View registered platform customers, audit order volumes and cumulative BDT expenditure, review verification status, and enforce account suspensions."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Customer Accounts</span>
          <div className="text-2xl font-bold text-neutral-900 mt-1">{customers.length} Users</div>
          <div className="text-xs text-neutral-400 mt-0.5">Verified buyers registered across Bangladesh</div>
        </div>

        <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Active Shopping Accounts</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{activeCount} Active</div>
          <div className="text-xs text-neutral-400 mt-0.5">{suspendedCount} accounts currently suspended</div>
        </div>

        <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Customer Expenditure</span>
          <div className="text-2xl font-bold text-neutral-900 mt-1">{formatBDT(totalSpentAll)}</div>
          <div className="text-xs text-neutral-400 mt-0.5">Gross historical payments across all buyer profiles</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search name, email, phone number, UID..."
            className="w-full pl-9.5 pr-4 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:border-black transition-colors"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:border-black transition-colors cursor-pointer"
          >
            <option value="all">All Customer Statuses</option>
            <option value="active">Active Buyers</option>
            <option value="suspended">Suspended Accounts</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-neutral-200/90 rounded-3xl overflow-hidden shadow-xs">
        {paginatedCustomers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customer accounts found"
            description="No customer records match the current search query or filter."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/70 text-xs font-bold uppercase tracking-wider text-neutral-500">
                  <th className="py-4 pl-6 pr-4">Customer Details</th>
                  <th className="py-4 px-4">Contact Info</th>
                  <th className="py-4 px-4">Verification</th>
                  <th className="py-4 px-4">Orders Placed</th>
                  <th className="py-4 px-4">Total Spent</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 pr-6 pl-4 text-right">Account Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm">
                {paginatedCustomers.map((cust) => {
                  const isSuspended = cust.status === 'suspended';

                  return (
                    <tr key={cust.id} className="hover:bg-neutral-50/70 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-4 pl-6 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {cust.displayName ? cust.displayName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-neutral-900">{cust.displayName}</div>
                            <div className="text-xs text-neutral-400 font-mono">
                              UID: {cust.firebaseUid?.substring(0, 12)}...
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-4 px-4 text-xs">
                        <div className="font-medium text-neutral-800">{cust.email}</div>
                        <div className="text-neutral-500 mt-0.5">{cust.phone || 'No phone'}</div>
                      </td>

                      {/* Verification Status */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                            cust.emailVerified 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                          }`}>
                            <Mail className="w-3 h-3" />
                            <span>{cust.emailVerified ? 'Email Verified' : 'Unverified'}</span>
                          </span>
                        </div>
                      </td>

                      {/* Orders */}
                      <td className="py-4 px-4 font-bold text-neutral-900">
                        {cust.totalOrders || 0} orders
                      </td>

                      {/* Total Spent */}
                      <td className="py-4 px-4 font-bold text-emerald-700">
                        {formatBDT(cust.totalSpentBDT || 0)}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <StatusBadge status={isSuspended ? 'Suspended' : 'Active'} />
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 pr-6 pl-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedCustomer(cust)}
                            className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer text-xs font-semibold px-2.5"
                          >
                            Profile
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleStatus(cust.id, cust.status)}
                            disabled={isSubmitting}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                              isSuspended
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                : 'border border-neutral-300 hover:bg-rose-50 hover:text-rose-700 text-neutral-700'
                            }`}
                          >
                            {isSuspended ? 'Reactivate' : 'Suspend'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 sm:p-5 border-t border-neutral-200 flex items-center justify-between">
            <div className="text-xs text-neutral-500">
              Showing {Math.min(filteredCustomers.length, (currentPage - 1) * itemsPerPage + 1)} to{' '}
              {Math.min(filteredCustomers.length, currentPage * itemsPerPage)} of {filteredCustomers.length} customers
            </div>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-neutral-900 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inspect Customer Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-neutral-200 shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-neutral-900">{selectedCustomer.displayName}</h3>
                <p className="text-xs text-neutral-500 mt-0.5">{selectedCustomer.email}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-1.5 rounded-lg text-neutral-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500">Firebase UID:</span>
                <span className="font-mono font-bold text-neutral-900 select-all">{selectedCustomer.firebaseUid}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Phone Number:</span>
                <span className="font-bold text-neutral-900">{selectedCustomer.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Total Orders:</span>
                <span className="font-bold text-neutral-900">{selectedCustomer.totalOrders || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Total Spent:</span>
                <span className="font-bold text-emerald-700">{formatBDT(selectedCustomer.totalSpentBDT || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Member Since:</span>
                <span className="font-medium text-neutral-800">
                  {selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-neutral-900 hover:bg-black text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
