export default function SeasonCard({ title, description }) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-black">{title}</h4>
      <p className="text-gray-500 flex items-center">{description}</p>
    </div>
  );
}
