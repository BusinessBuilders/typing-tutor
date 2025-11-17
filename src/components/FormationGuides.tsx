/**
 * Formation Guides Component
 * Step 158 - Letter formation and writing guides
 */

import { useState } from 'react';

export default function FormationGuides({ letter }: { letter: string }) {
  const [step, setStep] = useState(0);

  const steps = [
    { instruction: 'Start at the top', highlight: 'top' },
    { instruction: 'Draw down', highlight: 'middle' },
    { instruction: 'Complete the shape', highlight: 'bottom' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        How to Form: {letter.toUpperCase()}
      </h2>

      <div className="mb-8">
        <div className="relative w-64 h-64 mx-auto bg-gray-50 rounded-2xl border-4 border-dashed border-gray-300">
          <div className="absolute inset-0 flex items-center justify-center text-9xl font-bold text-gray-200">
            {letter.toUpperCase()}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-6 mb-6 text-center">
        <p className="text-xl text-blue-900 font-medium">
          {steps[step]?.instruction || 'Complete!'}
        </p>
      </div>

      <div className="flex justify-center gap-4">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full ${
              index <= step ? 'bg-primary-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={() => setStep(Math.min(step + 1, steps.length))}
          disabled={step >= steps.length}
          className="px-8 py-4 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 transition-colors disabled:opacity-50"
        >
          Next Step
        </button>
      </div>
    </div>
  );
}

// Tracing practice
export function TracingPractice() {
  const [progress, setProgress] = useState(0);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Trace the Letter
      </h2>

      <div className="w-64 h-64 mx-auto bg-yellow-50 rounded-2xl border-4 border-yellow-300 flex items-center justify-center mb-6">
        <div className="text-9xl font-bold text-yellow-300">A</div>
      </div>

      <div className="mb-4">
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-success-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <button
        onClick={() => setProgress(Math.min(progress + 20, 100))}
        className="w-full py-4 bg-primary-500 text-white rounded-lg font-bold"
      >
        Trace
      </button>
    </div>
  );
}
