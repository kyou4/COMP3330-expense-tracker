import { useQuery } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
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
      return res.json() as Promise<{ expenses: { id: number; title: string; amount: number,fileUrl:string }[] }>
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

  if (isLoading) return <p className="text-sm text-gray-500">Loading…</p>
  if (isError) return <p className="text-sm text-red-600">{(error as Error).message}</p>
  
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
