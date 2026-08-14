interface OrderFiltersProps {
  mobileSearch: string;
  setMobileSearch: (val: string) => void;
  orderStatus: string;
  setOrderStatus: (val: string) => void;
  paymentStatus: string;
  setPaymentStatus: (val: string) => void;
  fromDate: string;
  setFromDate: (val: string) => void;
  toDate: string;
  setToDate: (val: string) => void;
  deliveryTypeId: string;
  setDeliveryTypeId: (val: string) => void;
  priceCategoryId: string;
  setPriceCategoryId: (val: string) => void;
  onClear: () => void;
}

export default function OrderFilters({
  mobileSearch, setMobileSearch,
  orderStatus, setOrderStatus,
  paymentStatus, setPaymentStatus,
  fromDate, setFromDate,
  toDate, setToDate,
  deliveryTypeId, setDeliveryTypeId,
  priceCategoryId, setPriceCategoryId,
  onClear,
}: OrderFiltersProps) {
  const isAnyFilterActive = Boolean(
    mobileSearch || orderStatus || paymentStatus || fromDate || toDate || deliveryTypeId || priceCategoryId
  );

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-semibold">
        {/* Mobile Search */}
        <input
          type="text"
          placeholder="Search Mobile No..."
          value={mobileSearch}
          onChange={(e) => setMobileSearch(e.target.value)}
          className="h-9 border border-slate-200 rounded-lg px-3 focus:outline-none"
        />

        {/* Order Status */}
        <select
          value={orderStatus}
          onChange={(e) => setOrderStatus(e.target.value)}
          className="h-9 border border-slate-200 rounded-lg px-2 bg-white text-xs font-semibold focus:outline-none cursor-pointer"
        >
          <option value="">All Order Statuses</option>
          <option value="Confirmed">Confirmed</option>
          <option value="In Progress">In Progress</option>
          <option value="Draft">Draft</option>
          <option value="Closed">Closed</option>
        </select>

        {/* Payment Status */}
        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          className="h-9 border border-slate-200 rounded-lg px-2 bg-white text-xs font-semibold focus:outline-none cursor-pointer"
        >
          <option value="">All Payment Statuses</option>
          <option value="Paid">Paid</option>
          <option value="Partial">Partial</option>
          <option value="Pending">Pending</option>
        </select>

        {/* From Date */}
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="h-9 border border-slate-200 rounded-lg px-3 text-xs focus:outline-none bg-white"
        />
      </div>

      {isAnyFilterActive && (
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClear}
            className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}