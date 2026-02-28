import React from 'react';

export const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
  </div>
);

export const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
    {children}
  </div>
);

export const Button = ({ children, variant = 'primary', size = 'md', ...props }) => {
  const baseClasses = 'rounded-lg font-semibold transition duration-200';
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
    success: 'bg-green-600 hover:bg-green-700 text-white shadow-sm',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm',
    indigo: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm',
    outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary/5',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-600',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button className={`${baseClasses} ${variants[variant]} ${sizes[size]}`} {...props}>
      {children}
    </button>
  );
};

export const Input = ({ label, error, ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-gray-700 font-semibold mb-2">{label}</label>}
    <input
      className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition ${error ? 'border-red-500' : 'border-gray-300 focus:border-blue-600'
        }`}
      {...props}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

export const Select = ({ label, options, error, ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-gray-700 font-semibold mb-2">{label}</label>}
    <select
      className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition ${error ? 'border-red-500' : 'border-gray-300 focus:border-blue-600'
        }`}
      {...props}
    >
      <option value="">Select an option</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

export const Textarea = ({ label, error, ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-gray-700 font-semibold mb-2">{label}</label>}
    <textarea
      className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition ${error ? 'border-red-500' : 'border-gray-300 focus:border-blue-600'
        }`}
      {...props}
    ></textarea>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);
