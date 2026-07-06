export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-lg text-gray-500">Page not found</p>
      <a href="/" className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
        Go Home
      </a>
    </div>
  );
}
