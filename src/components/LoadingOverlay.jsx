/* eslint-disable react/prop-types */

export function LoadingOverlay({ message = "Submitting..." }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
        <svg
          className="animate-spin h-12 w-12 text-blue-500"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <span className="mt-4 text-blue-500 text-xl font-bold">{message}</span>
      </div>
    </div>
  );
}
