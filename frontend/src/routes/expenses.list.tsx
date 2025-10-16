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
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
interface Expense {
  id: number
  title: string
  amount: number
  fileUrl: string | null
}

export default function ExpensesList() {
  const qc = useQueryClient()
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3000/api/expenses')
      if (!res.ok) throw new Error('Failed to fetch expenses')
      const json = await res.json()
      return json as Promise<{ expenses: Expense[] }>
    },
  })
  const deleteExpense = useMutation({
  mutationFn: async (id: number) => {
    const res = await fetch(`/api/expenses/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (!res.ok) throw new Error('Failed to delete expense')
    return id
  },
  onMutate: async (id) => {
    await qc.cancelQueries({ queryKey: ['expenses'] })
    const previous = qc.getQueryData<{ expenses: Expense[] }>(['expenses'])
    if (previous) {
      qc.setQueryData(['expenses'], {
        expenses: previous.expenses.filter((item) => item.id !== id),
      })
    }
    return { previous }
  },
  onError: (_err, _id, ctx) => {
    if (ctx?.previous) qc.setQueryData(['expenses'], ctx.previous)
  },
  onSettled: () => {
    qc.invalidateQueries({ queryKey: ['expenses'] })
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
  if (!data || data.expenses.length === 0) return (
    <div className="rounded border bg-background p-6 text-center">
      <h3 className="text-lg font-semibold">No expenses yet</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Start by adding your first expense using the form above.
      </p>
    </div>
  )

  
  return (
  <ul className="mt-4 space-y-2">
    {data?.expenses.map((expense) => (
      <li
        key={expense.id}
        className="flex items-center justify-between rounded border bg-background p-3 shadow-sm"
      >
        <div className="flex flex-col">
          <span className="font-medium">{expense.title}</span>
          <span className="text-sm text-muted-foreground">${expense.amount}</span>
        </div>
        <div className="flex items-center gap-3">
          {expense.fileUrl && (
            <a
              href={expense.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 underline"
            >
              Download
            </a>
          )}
          <button
            type="button"
            onClick={() => deleteExpense.mutate(expense.id)}
            disabled={deleteExpense.isPending}
            className="text-sm text-red-600 underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleteExpense.isPending ? 'Removing…' : 'Delete'}
          </button>
        </div>
      </li>
    ))}
  </ul>
)

}
