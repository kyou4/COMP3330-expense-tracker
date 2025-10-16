import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
interface Expense {
  id: number
  title: string
  amount: number
  fileUrl: string | null
}
export default function AddExpenseForm() {
  const qc = useQueryClient()
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState<number | ''>('')
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (payload: { title: string; amount: number }) => {
      const res = await fetch('http://localhost:3000/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials:"include",
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to add expense')
      return res.json() as Promise<{ expense: { id: number; title: string; amount: number } }>
    },
    onMutate: async (newItem) => {
    await qc.cancelQueries({ queryKey: ['expenses'] })
    const previous = qc.getQueryData<{ expenses: Expense[] }>(['expenses'])
    if (previous) {
      const optimistic: Expense = {
        id: Date.now(),
        title: newItem.title,
        amount: newItem.amount,
        fileUrl: null,
      }
      qc.setQueryData(['expenses'], {
        expenses: [...previous.expenses, optimistic],
      })
    }
    return { previous }
  },
  onError: (_err, _newItem, ctx) => {
    if (ctx?.previous) qc.setQueryData(['expenses'], ctx.previous)
  },
  onSettled: () => {
  qc.invalidateQueries({ queryKey: ['expenses'] })
  setTitle('')
  setAmount('')
},
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      setTitle('')
      setAmount('')
    },
  })
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setFormError(null);

  if (!title.trim()) return setFormError('Title is required');
  if (typeof amount !== 'number' || amount <= 0) return setFormError('Amount must be greater than 0');

  mutation.mutate({ title: title.trim(), amount });
    };
  return (
    <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
  <input
    className="w-1/2 rounded border p-2"
    placeholder="Title"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
  />
  <input
    className="w-40 rounded border p-2"
    type="number"
    placeholder="Amount"
    value={amount}
    onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
  />
  <button
    type="submit"
    disabled={mutation.isPending}
     className="rounded border px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-40"
  >
    {mutation.isPending ? 'Adding…' : 'Add'}
  </button>

  {/* Show validation error or mutation error */}
  {formError && <p className="text-sm text-red-600">{formError}</p>}
  {mutation.isError && (
     <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
    <p>Could not load expenses. Please try again.</p>
    <button
      className="mt-2 rounded border border-red-300 px-3 py-1 text-xs text-red-700"
      onClick={() => qc.invalidateQueries({ queryKey: ['expenses'] })}
    >
      Retry
    </button>
  </div>)}
</form>
  )
}
