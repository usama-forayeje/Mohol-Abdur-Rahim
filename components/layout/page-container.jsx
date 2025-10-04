

export default function PageContainer({ children }) {
  return (
    <div className="h-[calc(100dvh-52px)] overflow-y-auto">
      <div className="flex flex-1 flex-col p-4 md:px-6 min-h-full">
        {children}
      </div>
    </div>
  )
}
