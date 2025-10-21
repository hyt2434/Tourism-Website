export function HighlightCard({ image, title, description, className = "" }) {
  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      <img
        src={image}
        alt={title}
        className="w-full h-[405px] object-cover rounded-lg"
      />
      <div className="flex flex-col gap-1">
        <h3 className="text-black">{title}</h3>
        <p className="text-gray-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
