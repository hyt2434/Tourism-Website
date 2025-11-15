// PartnerProfile.jsx
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

export default function PartnerProfile({ partner, onClose }) {
  if (!partner) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="bg-white max-w-2xl w-full p-6 rounded-2xl shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold">{partner.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">✕</button>
        </div>

        <div className="flex flex-col items-center text-center space-y-4">
          <img src={partner.logo} alt={partner.name} className="w-24 h-24 rounded-full object-cover" />
          <p className="text-gray-600">{partner.description}</p>

          <div className="text-sm text-gray-700 space-y-1">
            <p><strong>Email:</strong> {partner.email}</p>
            <p><strong>Phone:</strong> {partner.phone}</p>
            <p>
              <strong>Website:</strong>{" "}
              <a href={partner.website} className="text-blue-500 hover:underline">{partner.website}</a>
            </p>
            <div className="flex justify-center gap-3 mt-2">
              {partner.socials?.facebook && (
                <a href={partner.socials.facebook} className="text-blue-600 hover:underline">Facebook</a>
              )}
              {partner.socials?.instagram && (
                <a href={partner.socials.instagram} className="text-pink-500 hover:underline">Instagram</a>
              )}
            </div>
          </div>

          <Button
            onClick={() => (window.location.href = `/partners/${partner.id}`)}
            className="mt-4"
          >
            Book Now
          </Button>
        </div>
      </Card>
    </div>
  );
}
