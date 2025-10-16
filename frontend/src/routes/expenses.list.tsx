// import { useQuery } from '@tanstack/react-query'
// import { Link } from '@tanstack/react-router'
// export default function ExpensesList() {
//   const { data, isLoading, isError, error } = useQuery({
//     queryKey: ['expenses'],
//     queryFn: async () => {
//       const res = await fetch('http://localhost:3000/api/expenses')
//       if (!res.ok) throw new Error('Failed to fetch expenses')
//       return res.json() as Promise<{ expenses: { id: number; title: string; amount: number }[] }>
//     },
//   }) 
//   if (isLoading) return <p className="text-sm text-gray-500">Loading…</p>
//   if (isError) return <p className="text-sm text-red-600">{(error as Error).message}</p>
//   return (
//     <>
//     <ul className="mt-4 space-y-2">
//       {data!.expenses.map((e) => (
//         <Link to={`/expenses/${e.id}`} key={e.id} className="flex items-center justify-between rounded border bg-white p-3 shadow-sm">
//           <span className="font-medium">{e.title}</span>
//           <span className="tabular-nums">${e.amount}</span>
//         </Link>
//       ))}
//     </ul>
//     </>
//   )
// }
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

interface Expense {
  id: number
  title: string
  amount: number
  fileUrl: string | null
}

export default function ExpensesList() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3000/api/expenses')
      if (!res.ok) throw new Error('Failed to fetch expenses')
      const json = await res.json()
      return json.expenses as Expense[]
    },
  })

  if (isLoading) return <p className="text-sm text-gray-500">Loading…</p>
  if (isError) return <p className="text-sm text-red-600">{(error as Error).message}</p>
  if (!data || data.length === 0) return <p className="text-sm text-gray-500">No expenses found.</p>

  return (
    <ul className="mt-4 space-y-2">
      {data.map((e) => (
        <li key={e.id} className="flex items-center justify-between rounded border bg-white p-3 shadow-sm">
          <Link to={`/expenses/${e.id}`} className="font-medium text-blue-600 underline">
            {e.title}
          </Link>
          <div className="flex items-center gap-4">
            <span className="tabular-nums">${e.amount}</span>
            {e.fileUrl ? (
              <a
                href={e.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline text-sm"
              >
                Download
              </a>
            ) : (
              <span className="text-sm text-gray-500">Receipt not uploaded</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
