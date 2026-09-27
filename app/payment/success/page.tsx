import Link from 'next/link';

export default function PaymentSuccessPage() {
  return <main className="flex min-h-screen items-center justify-center bg-[#f6f3ee] px-5 text-center"><div className="max-w-md"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#74784f]">Payment received</p><h1 className="mt-4 text-3xl font-semibold text-[#2d2927]">Thank you for your order.</h1><p className="mt-3 text-sm leading-6 text-[#6f6963]">Your payment is being confirmed. We will prepare your order after PayMongo sends the official payment confirmation.</p><Link href="/" className="mt-7 inline-flex rounded-lg bg-[#2d2927] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white">Return to store</Link></div></main>;
}
