'use client';

import Link from 'next/link';
import { useState } from 'react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/galerie', label: 'Galerie' },
    { href: '/records', label: 'Hall of Fame' },
    { href: '/upload', label: 'Soumettre' },
  ];

  return (
    <header className="header-premium">
      <div className="section-container">
        <div className="flex items-center justify-between py-4">
          {/* Logo & Branding */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-hunting-orange to-orange-700 rounded-full flex items-center justify-center font-bold text-lg text-white shadow-lg group-hover:shadow-orange-500/50 transition-shadow">
              🦌
            </div>
            <div>
              <h1 className="text-white font-heading text-2xl tracking-wider">
                CHASSE
              </h1>
              <p className="text-hunting-gold text-xs font-semibold tracking-widest">
                GROUPE
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Admin Link & Mobile Menu */}
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="hidden sm:block text-hunting-gold text-sm font-bold uppercase tracking-wider hover:text-hunting-orange transition-colors"
            >
              Admin
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white hover:text-hunting-orange transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 border-t border-hunting-gold/20 pt-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-white hover:text-hunting-orange font-semibold transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/admin"
              className="block text-hunting-gold font-semibold transition-colors py-2 hover:text-hunting-orange"
              onClick={() => setMobileMenuOpen(false)}
            >
              Admin
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
