export default function BudgetPage() {
  return (
    <div className="p-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Budget</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Income Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Income</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-600">Total Income</span>
              <span className="text-lg font-semibold text-green-600">$0.00</span>
            </div>
            <p className="text-sm text-gray-500">No income categories yet</p>
          </div>
        </div>

        {/* Expenses Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Expenses</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-600">Total Expenses</span>
              <span className="text-lg font-semibold text-red-600">$0.00</span>
            </div>
            <p className="text-sm text-gray-500">No expense categories yet</p>
          </div>
        </div>
      </div>
    </div>
  );
}



