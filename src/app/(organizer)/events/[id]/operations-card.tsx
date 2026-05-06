'use client'

import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../../../convex/_generated/api'
import type { Id } from '../../../../../convex/_generated/dataModel'

interface OperationsCardProps {
  eventId: Id<'events'>
  roster: any[]
  expenses: any[]
}

export function OperationsCard({ eventId, roster, expenses }: OperationsCardProps) {
  const addExpense = useMutation(api.events.addExpense)
  const removeExpense = useMutation(api.events.removeExpense)
  const updatePaymentAmount = useMutation(api.events.updatePaymentAmount)

  const [isAddingExpense, setIsAddingExpense] = useState(false)
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!desc || !amount) return
    await addExpense({ eventId, description: desc, amount: parseFloat(amount) })
    setDesc('')
    setAmount('')
    setIsAddingExpense(false)
  }

  const handleUpdatePayment = async (participantId: Id<'participants'>, val: string) => {
    const num = val ? parseFloat(val) : undefined
    await updatePaymentAmount({ eventId, participantId, amount: num })
  }

  const revenue = roster.reduce((acc, p) => acc + (p.payment_amount || 0), 0)
  const costs = expenses.reduce((acc, exp) => acc + exp.amount, 0)
  const net = revenue - costs

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

  return (
    <div className="rounded-2xl border p-6 shadow-sm mb-8" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--neutral-900)' }}>Operations</h2>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Revenue', value: formatCurrency(revenue) },
          { label: 'Costs', value: formatCurrency(costs) },
          { label: 'Net', value: formatCurrency(net) },
        ].map((metric) => (
          <div key={metric.label} className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--neutral-50)' }}>
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{metric.label}</p>
            <p className="mt-1 text-xl font-semibold" style={{ color: 'var(--neutral-900)' }}>{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expenses List */}
        <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)' }}>
          <div className="mb-3 flex justify-between items-center">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--neutral-900)' }}>Expenses</h3>
            <button
              onClick={() => setIsAddingExpense(!isAddingExpense)}
              className="text-xs font-medium hover:underline"
              style={{ color: 'var(--accent)' }}
            >
              {isAddingExpense ? 'Cancel' : '+ Add'}
            </button>
          </div>
          
          {isAddingExpense && (
            <form onSubmit={handleAddExpense} className="mb-3 flex gap-2">
              <input
                type="text"
                placeholder="Description"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                className="form-input text-xs flex-1"
                required
              />
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="form-input text-xs w-20"
                step="0.01"
                min="0"
                required
              />
              <button type="submit" className="rounded-md bg-neutral-900 px-3 text-xs text-white">Save</button>
            </form>
          )}

          <div className="flex flex-col gap-2">
            {expenses.length === 0 ? (
              <p className="text-xs italic" style={{ color: 'var(--muted)' }}>No expenses logged.</p>
            ) : expenses.map(exp => (
              <div key={exp._id} className="flex justify-between items-center py-1.5 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                <span className="text-xs" style={{ color: 'var(--neutral-800)' }}>{exp.description}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium" style={{ color: 'var(--neutral-900)' }}>{formatCurrency(exp.amount)}</span>
                  <button onClick={() => removeExpense({ expenseId: exp._id })} className="text-[10px] text-red-500 hover:underline">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Participant Payments */}
        <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)' }}>
          <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--neutral-900)' }}>Participant Payments</h3>
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2">
            {roster.length === 0 ? (
              <p className="text-xs italic" style={{ color: 'var(--muted)' }}>No participants on roster.</p>
            ) : roster.map(p => (
              <div key={p.participant_id} className="flex justify-between items-center py-1 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                <span className="text-xs truncate max-w-[120px]" style={{ color: 'var(--neutral-800)' }}>{p.participant?.full_name || 'Unknown'}</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>$</span>
                  <input
                    type="number"
                    defaultValue={p.payment_amount || ''}
                    onBlur={(e) => handleUpdatePayment(p.participant_id, e.target.value)}
                    className="form-input text-xs w-20 px-2 py-1"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
