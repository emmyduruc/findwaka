import React from 'react';
import * as LucideIcons from 'lucide-react';
import { clsx } from 'clsx';

type IconName = keyof typeof LucideIcons;

interface IconProps {
  name: IconName;
  size?: number | string;
  className?: string;
  color?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  className,
  color,
}) => {
  const IconComponent = LucideIcons[name] as React.ComponentType<{
    size?: number | string;
    className?: string;
    color?: string;
  }>;

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <IconComponent
      size={size}
      className={clsx(className)}
      color={color}
    />
  );
};

