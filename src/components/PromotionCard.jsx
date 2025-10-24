export default function PromotionCard({ image, title, features }) {
  return (
    <div className="flex flex-col">
      <img
        src={image}
        alt={title}
        className="w-full h-[366px] object-cover rounded-lg mb-6"
      />
      <h4 className="text-black mb-2">{title}</h4>
      <ul className="text-gray-500 space-y-1 leading-relaxed">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-green-600 mt-1">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
