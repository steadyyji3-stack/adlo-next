import { Badge } from '@/components/ui/badge';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
}

export default function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <section className="pt-24 pb-16 px-6 bg-slate-50 border-b border-slate-100">
      <div className="max-w-4xl mx-auto text-center">
        <Badge
          variant="outline"
          className="mb-5 text-[#92400e] border-amber-200 bg-amber-50 tracking-widest text-xs font-bold uppercase"
        >
          {eyebrow}
        </Badge>
        <h1
          className="text-4xl md:text-5xl font-extrabold text-slate-800 mt-2 mb-4 tracking-tight"
          style={{ fontFamily: 'var(--font-manrope)' }}
        >
          {title}
        </h1>
        {description && (
          <p className="text-slate-500 text-lg leading-relaxed">{description}</p>
        )}
      </div>
    </section>
  );
}
