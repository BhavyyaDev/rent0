import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';

const CLERK_APPEARANCE = {
  layout: {
    socialButtonsPlacement: 'top' as const,
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: '!w-full !max-w-[620px] !rounded-3xl !shadow-2xl !border-0',
    card: '!bg-white !shadow-none !border-none !px-16 !py-12 !w-full',

    // Header
    headerTitle: '!text-4xl !font-extrabold !text-[#1a1a1a] !tracking-tight',
    headerSubtitle: '!text-lg !text-gray-500 !mt-1',

    // Social Buttons
    socialButtonsBlockButton:
      '!bg-white !border !border-gray-200 !text-gray-700 hover:!bg-gray-50 !rounded-2xl !py-4 !text-base !font-semibold !shadow-none',
    socialButtonsBlockButtonText: '!font-semibold !text-base',
    socialButtonsBlockButtonArrow: '!hidden',

    // Divider
    dividerRow: '!my-8',
    dividerLine: '!bg-gray-200',
    dividerText: '!text-sm !text-gray-400 !font-medium',

    // Form
    formFieldRow: '!mb-2',
    formFieldLabel: '!text-base !font-semibold !text-gray-800 !mb-1.5',
    formFieldInput:
      '!text-base !rounded-2xl !border-gray-200 !bg-gray-50 !py-4 !px-5 focus:!ring-[#d4f07a] focus:!bg-white !transition-colors',

    // Primary Button
    formButtonPrimary:
      '!text-base !bg-[#1a1a1a] !text-white !rounded-2xl !font-bold !py-4 hover:!bg-black !transition-colors !shadow-md !mt-2',

    // Footer
    footerActionLink: '!text-[#1a1a1a] !font-bold hover:!underline !text-base',
    footerActionText: '!text-base !text-gray-500',
    footer: '!bg-white !pb-2',

    // Internal card footer
    identityPreviewEditButton: '!text-base',
    formResendCodeLink: '!text-base',
  },
} as const;

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#f0f2f5] relative overflow-hidden flex flex-col">

      {/* Navbar */}
      <header className="w-full px-10 py-6 flex items-center justify-between z-10">
        <Link href="/" className="text-2xl font-extrabold tracking-tight text-[#1a1a1a]">
          RentO
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/items"
            className="text-sm font-medium text-gray-600 hover:text-[#1a1a1a] transition-colors"
          >
            Explore
          </Link>
          <Link
            href="/sign-in"
            className="px-6 py-2.5 border-2 border-[#d4f07a] text-[#1a1a1a] rounded-full text-sm font-bold hover:bg-[#d4f07a]/20 transition-colors"
          >
            Sign In
          </Link>
        </nav>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 pb-16 relative z-10">
        <SignUp appearance={CLERK_APPEARANCE} fallbackRedirectUrl="/onboarding" />
      </main>

      {/* Subtle bg blobs */}
      <div
        className="absolute bottom-[-15%] left-[-5%] w-[50%] h-[50%] rounded-full opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #d4f07a 0%, transparent 70%)' }}
      />
      <div
        className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #c7d2fe 0%, transparent 70%)' }}
      />
    </div>
  );
}
