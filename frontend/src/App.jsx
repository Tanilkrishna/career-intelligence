import React from 'react';
import { Link } from 'react-router-dom';

function App() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
        <h1 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-6">
          Career Intelligence
        </h1>
        <p className="text-gray-300 text-center mb-8">
          The ultimate platform to verify your skills, close the gap, and land your next role.
        </p>
        <Link 
          to="/dashboard"
          className="block w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-center font-semibold rounded-lg shadow-md transition duration-200 ease-in-out transform hover:-translate-y-0.5"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default App;
