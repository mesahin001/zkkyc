"use client";
import { useState, useEffect } from "react";
import { useZamaKYCAdmin } from "~~/hooks/kyc/useZamaKYCAdmin";

export const ZamaKYCAdminPanel = () => {
  const admin = useZamaKYCAdmin({ initialMockChains: {} });
  const [selectedUser, setSelectedUser] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const getMockDecryptedData = (userAddress: string, nameHash: string, addressHash: string) => {
    // Güvenlik kontrolü
    if (!userAddress || !nameHash || !addressHash) {
      return {
        fullName: "Unknown",
        dateOfBirth: "1990-01-01",
        address: "N/A",
        documentType: "N/A",
        documentNumber: "N/A",
        nationality: "N/A"
      };
    }
    const seed = parseInt(userAddress.slice(-8), 16);
    const nameSeed = parseInt(nameHash.slice(0, 8), 16);
    const addressSeed = parseInt(addressHash.slice(0, 8), 16);
    const firstNames = ["Ahmet", "Mehmet", "Ayşe", "Fatma", "Ali", "Zeynep", "Mustafa", "Elif"];
    const lastNames = ["Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Öztürk", "Aydın", "Arslan"];
    const cities = ["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya", "Konya", "Adana"];
    const streets = ["Atatürk Cad.", "İstiklal Sok.", "Cumhuriyet Mah.", "Barbaros Bulvarı"];
    const firstName = firstNames[nameSeed % firstNames.length];
    const lastName = lastNames[(nameSeed >> 3) % lastNames.length];
    const city = cities[addressSeed % cities.length];
    const street = streets[(addressSeed >> 2) % streets.length];
    const year = 1970 + (seed % 30);
    const month = String(1 + (seed % 12)).padStart(2, '0');
    const day = String(1 + (seed % 28)).padStart(2, '0');
    return {
      fullName: `${firstName} ${lastName}`,
      dateOfBirth: `${year}-${month}-${day}`,
      address: `${street} No:${10 + (addressSeed % 90)}, ${city}, Turkey`,
      documentType: seed % 2 === 0 ? "Passport" : "National ID",
      documentNumber: `${seed % 2 === 0 ? 'P' : 'T'}${userAddress.slice(-6).toUpperCase()}`,
      nationality: "TR"
    };
  };

  if (!isClient) return <div className="p-6">Loading...</div>;

  if (!admin.isConnected) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
          <p>Please connect your wallet to continue</p>
        </div>
      </div>
    );
  }

  if (!admin.isAdmin) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="alert alert-error">
          <h3 className="font-bold">❌ Access Denied</h3>
          <p>You are not the contract admin. Only the owner wallet can access this panel.</p>
          <p className="text-sm">Connected: {admin.accounts?.[0]}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Admin Panel - KYC Applications</h2>
        <button onClick={admin.refreshPendingList} className="btn btn-primary">
          🔄 Refresh
        </button>
      </div>

      {admin.message && (
        <div className="alert alert-info mb-4">{admin.message}</div>
      )}

      <h3 className="text-xl font-bold mb-4">
        Pending Applications ({admin.pendingApplications.length})
      </h3>

      {admin.pendingApplications.length === 0 ? (
        <div className="text-center p-8 border rounded">
          <p>No pending applications</p>
        </div>
      ) : (
        <div className="space-y-6">
          {admin.pendingApplications.map(app => {
            const mockData = getMockDecryptedData(app.user_address, app.nameHash, app.addressHash);
            return (
              <div key={app.user_address} className="border rounded-lg overflow-hidden">
                <div className="bg-base-200 p-4">
                  <h4 className="font-bold">Application Details</h4>
                  <p className="text-sm">Address: {app.user_address}</p>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div><strong>Name:</strong> {mockData.fullName}</div>
                  <div><strong>DOB:</strong> {mockData.dateOfBirth}</div>
                  <div><strong>Address:</strong> {mockData.address}</div>
                  <div><strong>Doc:</strong> {mockData.documentType}</div>
                </div>
                <div className="p-4 flex gap-2">
                  <button
                    onClick={() => admin.approveKYC(app.user_address)}
                    disabled={admin.isProcessing || !admin.ethersSigner}
                    className="btn btn-success"
                  >
                    ✓ Approve
                  </button>
                  <input
                    type="text"
                    placeholder="Rejection reason"
                    value={selectedUser === app.user_address ? rejectReason : ""}
                    onChange={(e) => {
                      setSelectedUser(app.user_address);
                      setRejectReason(e.target.value);
                    }}
                    className="input input-bordered flex-1"
                  />
                  <button
                    onClick={() => admin.rejectKYC(app.user_address, rejectReason)}
                    disabled={admin.isProcessing || !rejectReason}
                    className="btn btn-error"
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
