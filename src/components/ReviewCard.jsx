export default function ReviewCard({ quote, name, location, avatar }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8 flex flex-col gap-12 flex-1 hover:shadow-lg transition-shadow">
      <p className="text-black">{quote}</p>

      <div className="flex items-center gap-4">
        <div className="w-[45px] h-[45px] rounded-full bg-gray-300 overflow-hidden">
          {avatar && (
            <img
              src={avatar}
              alt={name}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-black flex items-center">{name}</span>
          <span className="text-gray-500 flex items-center">{location}</span>
        </div>
      </div>
    </div>
  );
}
