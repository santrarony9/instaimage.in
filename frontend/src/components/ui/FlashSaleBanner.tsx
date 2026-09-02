'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export function FlashSaleBanner({ 
  title, 
  subtitle, 
  validUntil,
  redirectUrl = '/services'
}: { 
  title: string, 
  subtitle: string, 
  validUntil: string,
  redirectUrl?: string
}) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isClient, setIsClient] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const targetDate = new Date(validUntil).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        setIsExpired(true);
      } else {
        setTimeLeft({
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [validUntil]);

  if (isExpired) return null;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-10 relative z-30">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-rose-600 via-red-500 to-orange-500 text-white shadow-[0_20px_40px_rgb(225,29,72,0.3)]">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-20 rounded-full blur-3xl animate-pulse"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-6 md:p-8 gap-6 md:gap-4">
          
          <div className="flex items-center gap-5 text-center md:text-left">
            <div className="hidden md:flex w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl items-center justify-center border border-white/30 shrink-0">
              <span className="text-3xl animate-bounce">🔩</span>
            </div>
            <div>
              <h3 className="text-xl md:text-3xl font-black mb-1 tracking-tight text-white">{title}</h3>
              <p className="text-rose-100 font-medium text-sm md:text-base">{subtitle}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-8 shrink-0">
            {isClient && (
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 w-12 h-12 md:width-14 md:height-14 rounded-xl flex items-center justify-center font-black text-xl md:text-2xl tabular-nums shadow-inner">
                    {timeLeft.hours.toString().padStart(2, '0')}
                  </div>
                  <span className="text-[10px] uppercase font-bold mt-1.5 text-rose-100 tracking-wider">Hours</span>
                </div>
                <div className="text-2xl font-black opacity-50 mt-2 md:mt-3">:</div>
                <div className="flex flex-col items-center">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 w-12 h-12 md:width-14 md:height-14 rounded-xl flex items-center justify-center font-black text-xl md:text-2xl tabular-nums shadow-inner">
                    {timeLeft.minutes.toString().padStart(2, '0')}
                  </div>
                  <span className="text-[10px] uppercase font-bold mt-1.5 text-rose-100 tracking-wider">Mins</span>
                </div>
                <div className="text-2xl font-black opacity-50 mt-2 md:mt-3">:</div>
                <div className="flex flex-col items-center">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 w-12 h-12 md:width-14 md:height-14 rounded-xl flex items-center justify-center font-black text-xl md:text-2xl tabular-nums shadow-inner">
                    {timeLeft.seconds.toString().padStart(2, '0')}
                  </div>
                  <span className="text-[10px] uppercase font-bold mt-1.5 text-rose-100 tracking-wider">Secs</span>
                </div>
              </div>
            )}

            <Link href={redirectUrl} className="bg-white text-rose-600 px-8 py-3.5 rounded-xl font-black text-sm uppercase tracking-widest shadow-[0_4px_15px_rgb(255,255,255,0.25)] hover:scale-105 hover:bg-rose-50 transition-all whitespace-nowrap">
              Claim Offer
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}