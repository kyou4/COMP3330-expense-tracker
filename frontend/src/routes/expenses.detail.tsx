// import { useQuery } from '@tanstack/react-query'
// import { useParams } from '@tanstack/react-router'
// export default function ExpenseDetail() {
  
//   const { id }= useParams ({ from: "/expenses/$id"})
//   const { data, isLoading, isError, error } = useQuery({
//     queryKey: ['expense',id],
//     queryFn: async () => {
//       const res = await fetch(`http://localhost:3000/api/expenses/${id}`)
//       if (!res.ok) throw new Error('Failed to fetch expenses')
//       return res.json() as Promise<{expense:{id:number,title:string,amount:number}}>
//     },
//   }) 
//   if (isLoading) return <p className="text-sm text-gray-500">Loading…</p>
//   if (isError) return <p className="text-sm text-red-600">{(error as Error).message}</p>
//   if (!data) return <p>No expense found</p>
//   return (
//         <li key={data.expense.id} className="flex items-center justify-between rounded border bg-white p-3 shadow-sm">
//           <span className="font-medium">{data.expense.title}</span>
//           <span className="tabular-nums">${data.expense.amount}</span>
//         </li>

//   )
// }

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { UploadExpenseForm } from '../components/UploadExpenseForm'

interface Expense {
  id: number
  title: string
  amount: number
  fileUrl: string | null
}

export default function ExpenseDetail() {
  const { id } = useParams({ from: '/expenses/$id' })
  const expenseId = Number(id)
  const queryClient = useQueryClient()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['expense', expenseId],
    queryFn: async () => {
      const res = await fetch(`http://localhost:3000/api/expenses/${expenseId}`, {
        credentials: 'include'})
      if (!res.ok) throw new Error('Failed to fetch expense')
      return res.json() as Promise<{ expense: Expense }>
    },
  })

  if (isLoading) {
  return (
    <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      Loading expenses…
    </div>
  )
}
  if (isError) return <p className="text-sm text-red-600">{(error as Error).message}</p>
  if (!data?.expense) return <p className="text-sm text-gray-500">No expense found</p>

  const expense = data.expense

  return (
    <div className="space-y-4">
      {/* Expense info */}
      <div className="flex items-center justify-between rounded border bg-white p-3 shadow-sm">
        <span className="font-medium">{expense.title}</span>
        <span className="tabular-nums">${expense.amount}</span>
      </div>

      {/* Upload form */}
      <UploadExpenseForm
        expenseId={expenseId}
        onUploadSuccess={() =>
          queryClient.invalidateQueries({ queryKey: ['expense', expenseId] })
        }
      />

      {/* Conditional download link */}
      {expense.fileUrl ? (
        <a
          href={expense.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          Download Receipt
        </a>
      ) : (
        <p className="text-sm text-gray-500">Receipt not uploaded</p>
      )}
    </div>
  )
}