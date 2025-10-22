import Link from 'next/link'
import { getCurrentUser } from '@/lib/actions/auth'
import { Shield, User, Download, ArrowRight, BookOpen, Users, Sparkles } from 'lucide-react'

export default async function Home() {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Hero Section */}
      <div className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20">
          <div className="text-center">
            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
              Create Meaningful
              <span className="block text-blue-600 dark:text-blue-400">LDS Talks</span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed">
              Generate personalized sacrament meeting and stake conference talks using only official Church content.
              Share your testimony with confidence and authenticity.
            </p>

            {/* Talk Generation Card */}
            <div className="max-w-2xl mx-auto mb-16">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 transition-colors">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    What would you like to speak about?
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Enter your topic and we&apos;ll create a personalized talk using official Church content
                  </p>
                </div>

                <form action="/questionnaire" method="GET" className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      name="topic"
                      placeholder="e.g., Faith, Service, Gratitude, Forgiveness..."
                      className="flex-1 px-4 py-4 text-lg border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    <button
                      type="submit"
                      className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Generate Talk
                    </button>
                  </div>
                </form>

                <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                  <Shield className="w-4 h-4 mr-2" />
                  Uses only official content from churchofjesuschrist.org
                </div>
              </div>
            </div>

            {/* Authentication Section */}
            {!user && (
              <div className="max-w-xl mx-auto mb-16">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 border border-blue-100 dark:border-blue-800 transition-colors">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Save & Manage Your Talks
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Create a free account to save your talks, export to Word, and access them anytime.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link
                        href="/auth/register"
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        Create Free Account
                      </Link>
                      <Link
                        href="/auth/login"
                        className="inline-flex items-center justify-center px-6 py-3 border border-blue-300 dark:border-blue-600 text-base font-medium rounded-xl text-blue-700 dark:text-blue-400 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                      >
                        Sign In
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose LDS Talk Generator?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Built specifically for members of The Church of Jesus Christ of Latter-day Saints
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                <BookOpen className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Official Church Content</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                All content sourced exclusively from churchofjesuschrist.org ensuring doctrinal accuracy and appropriateness.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                <User className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Personal & Authentic</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Talks written in first person with space for your personal stories and testimony to shine through.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                <Download className="w-10 h-10 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Export to Word</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Download your talks as formatted Word documents for easy editing, printing, and sharing.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Create Your Next Talk?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of Church members who trust LDS Talk Generator for their speaking assignments.
          </p>
          <Link
            href={user ? "/dashboard" : "/auth/register"}
            className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {user ? "Go to Dashboard" : "Get Started Free"}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}