import { ZamaKYCForm } from "./_components/ZamaKYCForm";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl px-8 py-6 shadow-2xl mb-6">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3 flex items-center justify-center gap-3">
              <span className="text-5xl">🔐</span>
              zkKYC System
            </h1>
            <p className="text-lg opacity-90">Confidential Identity Verification using FHE</p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="card bg-white shadow-lg">
                <div className="card-body items-center text-center p-6">
                  <div className="text-4xl mb-2">🔒</div>
                  <h3 className="font-bold text-lg">Fully Encrypted</h3>
                  <p className="text-xs text-gray-600">Data encrypted on-chain using FHE</p>
                </div>
              </div>
              <div className="card bg-white shadow-lg">
                <div className="card-body items-center text-center p-6">
                  <div className="text-4xl mb-2">🕵️</div>
                  <h3 className="font-bold text-lg">Zero Knowledge</h3>
                  <p className="text-xs text-gray-600">Privacy-preserving verification</p>
                </div>
              </div>
              <div className="card bg-white shadow-lg">
                <div className="card-body items-center text-center p-6">
                  <div className="text-4xl mb-2">⚡</div>
                  <h3 className="font-bold text-lg">Instant Approval</h3>
                  <p className="text-xs text-gray-600">Real-time admin verification</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KYC Form */}
        <ZamaKYCForm />
      </div>
    </div>
  );
}
