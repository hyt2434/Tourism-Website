import { useParams, Link } from "react-router-dom";
import { mockPartners } from "./PartnerData";
import { Button } from "../ui/button";
import { Star, MapPin, Phone, Globe, Mail } from "lucide-react";

export default function PartnerDetail() {
  const { id } = useParams();
  const partner = mockPartners.find((p) => p.id === parseInt(id));

  if (!partner) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-600">
        <p>❌ Partner not found</p>
        <Link to="/partner" className="text-blue-600 underline mt-3">
          ← Back to Partners
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-6">
        {/* Header section */}
        <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col md:flex-row gap-8 items-center">
          <img
            src={partner.logo}
            alt={partner.name}
            className="w-40 h-40 rounded-full object-cover shadow"
          />

          <div className="flex-1 space-y-3">
            <h1 className="text-3xl font-bold">{partner.name}</h1>
            <p className="text-gray-600">{partner.description}</p>

            <div className="flex items-center gap-3 mt-2">
              <Star className="text-yellow-400 w-5 h-5" />
              <Star className="text-yellow-400 w-5 h-5" />
              <Star className="text-yellow-400 w-5 h-5" />
              <Star className="text-yellow-400 w-5 h-5" />
              <Star className="text-gray-300 w-5 h-5" />
              <span className="text-gray-500 text-sm">(230 reviews)</span>
            </div>

            <div className="text-sm text-gray-700 space-y-1">
              <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> {partner.email}</p>
              <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> {partner.phone}</p>
              <p className="flex items-center gap-2"><Globe className="w-4 h-4" /> 
                <a href={partner.website} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                  {partner.website}
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* About section */}
        <section className="mt-10 bg-white p-8 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">About {partner.name}</h2>
          <p className="text-gray-700 leading-relaxed">
            {partner.name} has been one of our trusted travel partners, providing guests with exceptional
            service, comfort, and unforgettable experiences. Whether you’re exploring Vietnam’s
            breathtaking landscapes or relaxing at a seaside resort, {partner.name} ensures every trip is memorable.
          </p>
        </section>

        {/* Offers section */}
        <section className="mt-10 bg-white p-8 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Available Tours</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border p-4 rounded-xl hover:shadow-md transition-all duration-200">
                <img
                  src={`https://source.unsplash.com/600x400/?travel,vietnam,${i}`}
                  alt="Tour"
                  className="rounded-lg mb-3"
                />
                <h3 className="text-lg font-semibold">Tour Package #{i}</h3>
                <p className="text-gray-600 text-sm mb-2">Duration: {2 + i} days</p>
                <p className="text-gray-700 mb-3">
                  A specially curated travel experience with {partner.name}.
                </p>
                <Button>Book This Tour</Button>
              </div>
            ))}
          </div>
        </section>

        {/* Contact section */}
        <section className="mt-10 bg-white p-8 rounded-2xl shadow-sm text-center">
          <h2 className="text-2xl font-semibold mb-3">Get in Touch</h2>
          <p className="text-gray-600 mb-4">
            Have questions or special requests? Contact {partner.name} directly or message through our platform.
          </p>
          <Button className="mt-3">Contact Partner</Button>
        </section>

{/* Customer Reviews Section */}
<section className="mt-10 bg-white p-8 rounded-2xl shadow-sm">
  <h2 className="text-2xl font-semibold mb-4">Customer Reviews</h2>

  {/* Rating Summary */}
  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
    <div className="flex items-center gap-2">
      <Star className="w-5 h-5 text-yellow-400 fill-current" />
      <Star className="w-5 h-5 text-yellow-400 fill-current" />
      <Star className="w-5 h-5 text-yellow-400 fill-current" />
      <Star className="w-5 h-5 text-yellow-400 fill-current" />
      <Star className="w-5 h-5 text-gray-300" />
      <span className="ml-2 text-gray-600 text-sm">(4.0 out of 5 — 3 reviews)</span>
    </div>

    <Button variant="outline" className="mt-3 md:mt-0">Write a Review</Button>
  </div>

  {/* Reviews List */}
  <div className="space-y-6">
    {[
      {
        name: "Linh Tran",
        date: "Oct 12, 2024",
        rating: 5,
        comment: "Amazing experience! Everything was well organized and the staff were very friendly.",
      },
      {
        name: "John Nguyen",
        date: "Sep 5, 2024",
        rating: 4,
        comment: "Great tour, but wish the trip lasted a bit longer!",
      },
      {
        name: "Sara Pham",
        date: "Aug 20, 2024",
        rating: 3,
        comment: "Good service overall, but hotel could be improved.",
      },
    ].map((review, i) => (
      <div key={i} className="border-b pb-4">
        <div className="flex items-center gap-3 mb-2">
          <img
            src={`https://source.unsplash.com/50x50/?face,person,${i}`}
            alt={review.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-medium">{review.name}</p>
            <p className="text-gray-500 text-sm">{review.date}</p>
          </div>
        </div>
        <div className="flex items-center mb-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className={`w-4 h-4 ${
                index < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <p className="text-gray-700">{review.comment}</p>
      </div>
    ))}
  </div>

  {/* Add Review Form */}
  <div className="mt-8 border-t pt-6">
    <h3 className="text-lg font-semibold mb-3">Leave a Review</h3>
    <form
      onSubmit={(e) => {
        e.preventDefault();
        alert("✅ Your review has been submitted!");
      }}
      className="space-y-3"
    >
      <textarea
        placeholder="Write your experience here..."
        className="w-full border rounded-lg p-3 focus:outline-none focus:ring focus:ring-blue-300"
        rows="4"
        required
      ></textarea>
      <Button type="submit" className="w-full md:w-auto">
        Submit Review
      </Button>
    </form>
  </div>
</section>

        {/* Back button */}
        <div className="text-center mt-10">
          <Link to="/partner" className="text-blue-600 hover:underline">
            ← Back to Partner List
          </Link>
        </div>
      </div>
    </div>
  );
}
