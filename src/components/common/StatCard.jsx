import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  trendPositive = true,
  iconColor = 'bg-brand-50 text-brand-600',
  accentBorder = ''
}) {
  return (
    <div className={`bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden ${accentBorder}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-navy-900 mt-1.5 tracking-tight">{value}</h3>
          
          {(subtext || trend) && (
            <div className="flex items-center gap-1.5 mt-2">
              {trend && (
                <span className={`inline-flex items-center text-xs font-semibold ${
                  trendPositive ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {trendPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                  {trend}
                </span>
              )}
              {subtext && <span className="text-xs text-slate-400">{subtext}</span>}
            </div>
          )}
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl ${iconColor}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}
