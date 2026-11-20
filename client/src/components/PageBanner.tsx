import { ReactNode } from 'react';
import { FALLBACK_GRADIENT, imageLayers } from '../utils/images';

// Banner with your own background photo (client/public/images/):
//   banner.(jpg|png|webp)  -> used on every page
//   <image>.(jpg|png|webp) -> used on that page only (dashboard, medicines, pharmacies, orders)
export default function PageBanner({ image, eyebrow, title, subtitle, actions }: {
  image?: string; eyebrow?: string; title: string; subtitle?: ReactNode; actions?: ReactNode;
}) {
  const layers = [
    // darkens the left side so the text stays readable on any photo
    'linear-gradient(100deg, rgba(63,16,41,.82) 0%, rgba(63,16,41,.5) 50%, rgba(63,16,41,.12) 100%)',
    ...(image ? imageLayers(image) : []),
    ...imageLayers('banner'),
    FALLBACK_GRADIENT,
  ].join(', ');

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 text-white shadow-xl shadow-brand-900/15 md:p-9"
      style={{ backgroundImage: layers, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="min-w-0">
          {eyebrow && <p className="text-sm font-medium text-brand-100/90">{eyebrow}</p>}
          <h1 className="mt-1 text-3xl font-extrabold md:text-4xl">{title}</h1>
          {subtitle && <p className="mt-2 max-w-xl text-brand-50/85">{subtitle}</p>}
        </div>
        {actions}
      </div>
    </div>
  );
}
