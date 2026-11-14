import type { ButtonHTMLAttributes, ReactNode } from 'react'

const looks = {
  primary: 'bg-brass text-veneer-deep hover:bg-[#e4c278]',
  secondary: 'bg-veneer-hi text-lace hover:bg-veneer-hover',
  danger: 'bg-transparent text-[#ffb4a2] underline underline-offset-[0.22em] hover:text-[#ffd2c6]',
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { look?: keyof typeof looks }

/** The admin's one button shape: tall enough for a thumb, presses in a little. */
export function Button({ look = 'secondary', className = '', type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-13 items-center justify-center gap-2 rounded-[3px] px-5 text-[17px] font-medium transition-[background-color,color,scale,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 ${looks[look]} ${className}`}
      {...props}
    />
  )
}

export const inputClass =
  'w-full min-h-13 rounded-[3px] bg-veneer-deep px-4 text-[17px] text-lace placeholder:text-lace-soft/60 outline-none ring-brass focus-visible:ring-2 focus-visible:outline-none'

/** A label above its control, an optional hint under it. */
export function Field({ label, hint, htmlFor, children }: { label: string; hint?: ReactNode; htmlFor?: string; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <label htmlFor={htmlFor} className="text-base font-medium">
        {label}
      </label>
      {children}
      {hint && <p className="text-[15px] leading-snug text-lace-soft">{hint}</p>}
    </div>
  )
}

/** The cut-out on a dark shelf-like ground, as it will look on the site. */
export function Thumb({ src, alt = '', className = '' }: { src: string; alt?: string; className?: string }) {
  return (
    <span className={`flex items-end justify-center overflow-hidden rounded-[3px] bg-inside p-1.5 ${className}`}>
      <img src={src} alt={alt} className="max-h-full max-w-full object-contain" loading="lazy" />
    </span>
  )
}
