import Editor from './components/Editor'

export default function App() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-50 via-green-100 to-green-200 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white/80 border-r border-gray-200 shadow-lg flex flex-col p-4">
        <div className="text-lg font-semibold mb-4 text-gray-700">Sidebar</div>
        {/* Sidebar content placeholder */}
        <nav className="flex flex-col gap-2 text-gray-600">
          <button className="py-2 px-3 rounded hover:bg-green-100 transition">Home</button>
          <button className="py-2 px-3 rounded hover:bg-green-100 transition">Notes</button>
          <button className="py-2 px-3 rounded hover:bg-green-100 transition">Settings</button>
        </nav>
      </aside>
      {/* Main content area */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Editor area */}
        <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
          <div className="w-full max-w-4xl h-full flex items-center justify-center">
            <Editor />
          </div>
        </div>
      </main>
    </div>
  )
}
