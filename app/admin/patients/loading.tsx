export default function Loading() {
  return (
    <div className="p-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
      <div className="h-12 bg-gray-200 rounded mb-4" />
      {[1,2,3,4,5,6,7,8].map(i => (
        <div key={i} className="h-14 bg-gray-100 rounded mb-2" />
      ))}
    </div>
  );
}
