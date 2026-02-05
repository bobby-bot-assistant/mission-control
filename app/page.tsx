export default function Home() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Activity Feed</h1>
        <p className="text-zinc-500">At-a-glance overview of everything happening</p>
      </div>
      
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
          <p className="text-2xl font-bold">0</p>
          <p className="text-sm text-zinc-500">Active Projects</p>
        </div>
        <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
          <p className="text-2xl font-bold">0</p>
          <p className="text-sm text-zinc-500">Open Tasks</p>
        </div>
        <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
          <p className="text-2xl font-bold">0</p>
          <p className="text-sm text-zinc-500">Documents</p>
        </div>
        <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
          <p className="text-2xl font-bold">0</p>
          <p className="text-sm text-zinc-500">People</p>
        </div>
      </div>
      
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-8 text-center">
        <p className="text-zinc-500 mb-2">📊</p>
        <p className="text-lg font-medium mb-1">Activity Feed Coming Soon</p>
        <p className="text-sm text-zinc-500">This dashboard will show recent activity across all screens</p>
      </div>
    </div>
  )
}
