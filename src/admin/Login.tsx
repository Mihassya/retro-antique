import { useState, type FormEvent } from 'react'
import { backend } from '../lib/backend'
import { Button, Field, inputClass } from './ui'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const demo = backend.mode === 'demo'

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      await backend.signIn(email.trim(), password)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось войти')
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto grid max-w-sm gap-8 px-4 pt-16 pb-24">
      <div>
        <h1 className="font-display text-[44px] leading-none font-bold tracking-[-0.04em]">Ретро</h1>
        <p className="mt-3 text-lace-soft">Вход для владельца лавки</p>
      </div>
      <form onSubmit={submit} className="grid gap-5">
        <Field label="Почта" htmlFor="email">
          <input
            id="email"
            type="email"
            autoComplete="username"
            required={!demo}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Пароль" htmlFor="password" hint={demo ? 'В демо-режиме подойдёт любой.' : undefined}>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required={!demo}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </Field>
        {error && (
          <p role="alert" className="text-[#ffb4a2]">
            {error}
          </p>
        )}
        <Button type="submit" look="primary" disabled={busy}>
          {busy ? 'Входим…' : 'Войти'}
        </Button>
      </form>
    </main>
  )
}
