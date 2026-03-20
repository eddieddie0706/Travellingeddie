import {
  Plane, TrainFront, Bus, Car, Ship,
  UtensilsCrossed, Wine, Coffee, Hotel,
  Sparkles, ShoppingBag, Camera, Landmark,
  Music, MapPin,
} from 'lucide-react';
import type { ActivityCategory } from '../types';
import { CATEGORY_CONFIG } from '../types';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Plane, TrainFront, Bus, Car, Ship,
  UtensilsCrossed, Wine, Coffee, Hotel,
  Sparkles, ShoppingBag, Camera, Landmark,
  Music, MapPin,
};

interface Props {
  category: ActivityCategory;
  size?: number;
  showLabel?: boolean;
}

export default function CategoryIcon({ category, size = 18, showLabel = false }: Props) {
  const config = CATEGORY_CONFIG[category];
  const Icon = ICON_MAP[config.icon] || MapPin;

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-flex items-center justify-center rounded-md"
        style={{
          backgroundColor: config.color + '18',
          color: config.color,
          width: size + 10,
          height: size + 10,
        }}
      >
        <Icon size={size} />
      </span>
      {showLabel && <span className="text-sm" style={{ color: config.color }}>{config.label}</span>}
    </span>
  );
}
