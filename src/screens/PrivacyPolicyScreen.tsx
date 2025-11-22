import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

/**
 * Privacy Policy Screen
 * Displays the app's privacy policy for COPPA compliance
 */

const PrivacyPolicyScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="privacy-policy-screen min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-purple-600 hover:text-purple-700 flex items-center gap-2 text-lg"
        >
          ← Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Last Updated: November 22, 2025
          </p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Autism Typing Tutor is an educational app designed specifically for children with autism
                to learn typing skills through AI-powered personalized learning. We are committed to
                protecting the privacy of our users, especially children.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Children's Privacy (COPPA Compliance)
              </h2>
              <p className="text-gray-700 leading-relaxed">
                This app is designed for children under 13 years old. We comply with the Children's
                Online Privacy Protection Act (COPPA). We do not knowingly collect personal information
                from children without parental consent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Information We Collect
              </h2>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                <p className="font-semibold text-blue-800 mb-2">
                  ✓ All data is stored locally on your device
                </p>
                <p className="text-blue-700 text-sm">
                  We do not transmit personal data to external servers except for AI and image services.
                </p>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Data Collected Locally:
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li><strong>Typing Performance</strong>: Words typed, accuracy scores, typing speed, mistakes</li>
                <li><strong>Learning Progress</strong>: Word mastery levels, comprehension results, skill metrics</li>
                <li><strong>User Preferences</strong>: App settings, themes, font sizes</li>
                <li><strong>Gameplay Data</strong>: Achievements, badges, pet progress</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Why We Collect This Data:
              </h3>
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                <p className="text-gray-700 leading-relaxed">
                  We collect scores and performance data to <strong>better serve learners</strong>.
                  Our AI analyzes typing patterns to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 mt-2 ml-4">
                  <li>Personalize learning difficulty</li>
                  <li>Identify which words need more practice</li>
                  <li>Track progress and improvements</li>
                  <li>Provide appropriate encouragement</li>
                  <li>Optimize the educational experience</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Third-Party Services
              </h2>

              <div className="space-y-3">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-1">OpenAI (GPT-4o-mini)</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Purpose:</strong> Generate educational content (words, sentences, questions)
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Data sent:</strong> Content type requests (e.g., "generate a word about animals")
                  </p>
                  <p className="text-sm text-green-700">
                    <strong>✓ Data NOT sent:</strong> Child's name, performance data, or any identifying information
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-1">Unsplash</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Purpose:</strong> Fetch educational images for visual learning
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Data sent:</strong> Search keywords (e.g., "butterfly", "apple")
                  </p>
                  <p className="text-sm text-green-700">
                    <strong>✓ Data NOT sent:</strong> Any personal or performance data
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Data Security
              </h2>
              <ul className="list-none text-gray-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>All data stored locally on your device</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>No cloud storage or data transmission</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>No user accounts or login required</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>No tracking or analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>No data selling or sharing with third parties</span>
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Parental Rights
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                As a parent or guardian, you can:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>View all stored data through the Parent Dashboard</li>
                <li>Delete all progress and settings at any time</li>
                <li>Control usage and monitor progress</li>
                <li>Export progress reports</li>
              </ul>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-4">
                <p className="font-semibold text-yellow-800 mb-2">
                  How to Delete All Data:
                </p>
                <p className="text-yellow-700 text-sm">
                  Go to <strong>Settings → Privacy & Data → Clear All Data</strong>
                  <br />
                  Or simply uninstall the app to remove all stored data.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Contact Us
              </h2>
              <p className="text-gray-700 leading-relaxed">
                If you have questions about this Privacy Policy:
                <br />
                <strong>Email:</strong> [Insert your contact email]
                <br />
                <strong>Support:</strong> Available through Settings → Help
              </p>
            </section>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mt-8">
              <p className="text-sm text-purple-900 font-medium">
                This Privacy Policy complies with:
              </p>
              <ul className="text-sm text-purple-800 mt-2 space-y-1">
                <li>• Children's Online Privacy Protection Act (COPPA)</li>
                <li>• Google Play Family Policy</li>
                <li>• Apple App Store Guidelines for Kids Category</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicyScreen;
