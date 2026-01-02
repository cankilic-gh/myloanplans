export default function LoansPage() {
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Loan Plans</h1>
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Add Loan
        </button>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="p-6">
          <p className="text-center text-gray-500">No loans added yet</p>
          <p className="mt-2 text-center text-sm text-gray-400">
            Click "Add Loan" to create your first loan plan
          </p>
        </div>
      </div>
    </div>
  );
}






