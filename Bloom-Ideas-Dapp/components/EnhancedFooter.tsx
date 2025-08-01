// components/EnhancedFooter.tsx
'use client'

import Link from 'next/link'
import { Flower2 } from 'lucide-react'
import { useGardenTheme } from './garden-theme-context';

export default function EnhancedFooter() {
  const { gardenTheme } = useGardenTheme();
  const getThemeGradient = () => {
    switch (gardenTheme) {
      case 'spring':
        return 'bg-gradient-to-r from-emerald-50/80 to-teal-50/80';
      case 'summer':
        return 'bg-gradient-to-r from-yellow-50/80 to-orange-100/80';
      case 'autumn':
        return 'bg-gradient-to-r from-orange-50/80 to-red-100/80';
      case 'winter':
        return 'bg-gradient-to-r from-blue-50/80 to-purple-100/80';
      default:
        return 'bg-gradient-to-r from-emerald-50/80 to-teal-50/80';
    }
  };
  return (
    <footer
      className={`mt-20 border-t border-emerald-200/50 ${getThemeGradient()} backdrop-blur-sm rounded-t-2xl animate-fade-in-up`}
    >
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Top Row */}
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            <img src="/Logo-bloomideas.png" alt="Bloom Ideas Logo" className="w-10 h-10 rounded-full shadow" />
            <div>
              <h3
                className="
                  text-2xl font-bold
                  bg-gradient-to-r from-emerald-600 to-teal-600
                  bg-clip-text text-transparent animate-text
                "
              >
                Bloom Ideas
              </h3>
              <p className="text-sm text-emerald-600/70">
                Where ideas flourish and dreams bloom
              </p>
            </div>
          </div>

          {/* Tagline Icons */}
          <div
            className="
              flex items-center gap-4 text-emerald-600/70 text-sm
              animate-pulse
            "
          >
            <span>🌱 Plant</span>
            <span>🌿 Grow</span>
            <span>🌸 Bloom</span>
            <span>🌻 Harvest</span>
          </div>

          {/* Social & Contact */}
          <div className="flex flex-wrap items-center gap-4 text-emerald-600/70 text-sm">
            <Link
              href="https://x.com/Bloom_Ideas"
              target="_blank"
              className="hover:text-emerald-800 transition"
            >
              🌐 @Bloom_Ideas
            </Link>
            <Link
              href="https://x.com/pranshurastogii"
              target="_blank"
              className="hover:text-emerald-800 transition"
            >
              🐦 @pranshurastogii
            </Link>
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && (window as any).activateGardenCursor) {
                  (window as any).activateGardenCursor()
                }
              }}
              className="
                px-4 py-2 rounded-full
                bg-gradient-to-r from-emerald-500 to-teal-500
                text-white text-sm font-medium
                hover:from-emerald-600 hover:to-teal-600
                transform hover:scale-105 transition-all duration-200
                shadow-lg hover:shadow-xl
                border border-emerald-400/30
              "
            >
              🌱 Touch Grass
            </button>
          </div>
        </div>
        <div className="flex justify-center">
          <Link
            href="/glossary"
            className="hover:text-emerald-800 transition"
          >
            📖 Glossary
          </Link>
        </div>

        {/* Help & Credits */}
        <div className="text-center text-sm text-emerald-600/70 space-y-1">
          <p>🌟 Stay curious, keep blooming!</p>
          <p>
            Made with&nbsp;
            <span role="img" aria-label="love">
              💚
            </span>
            &nbsp;by{' '}
            <Link
              href="https://x.com/pranshurastogii"
              target="_blank"
              className="font-medium hover:text-emerald-800 transition"
            >
              Pranshu Rastogi
            </Link>
          </p>
          <p>
            Need help or feedback? Say hello at{' '}
            <a
              href="mailto:bloomideas.team@gmail.com"
              className="font-medium hover:text-emerald-800 transition"
            >
              bloomideas.team@gmail.com
            </a>
          </p>
          <p>© {new Date().getFullYear()} Bloom Ideas. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
