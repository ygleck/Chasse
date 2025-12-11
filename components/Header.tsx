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
    <header className="header-premium border-b border-hunting-gold/30" style={{ 
      backgroundImage: 'linear-gradient(to bottom, rgba(26, 61, 42, 0.98), rgba(26, 61, 42, 1)), url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4a574\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
    }}>
      <div className="section-container">
        <div className="flex items-center justify-between py-5">
          {/* Logo & Branding - Agrandi */}
          <Link href="/" className="flex items-center gap-4 group">
            <div className="w-14 h-14 bg-gradient-to-br from-hunting-orange via-orange-600 to-orange-700 rounded-full flex items-center justify-center font-bold text-2xl text-white shadow-xl group-hover:shadow-orange-500/60 group-hover:scale-105 transition-all duration-300">
              🦌
            </div>
            <div>
              <h1 className="text-white font-heading text-3xl tracking-wider drop-shadow-lg">
                CHASSE
              </h1>
              <p className="text-hunting-gold text-sm font-bold tracking-widest drop-shadow-md">
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

          {/* Admin Badge & Mobile Menu */}
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-hunting-gold/20 hover:bg-hunting-orange border border-hunting-gold/40 rounded-lg text-hunting-gold hover:text-white text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <span>⚙️</span>
              <span>Admin</span>
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
