import { Link } from 'react-router-dom';
import { Plane, MapPin, Building2 } from 'lucide-react';
// CIAR logo
// The logo is located at: client/public/yes/logo.png
// In Vite, files in public folder are served from root, so path is /yes/logo.png
// Add a version query to force browsers to fetch the latest logo instead of using an old cached copy
const logoImage = '/yes/logo.png?v=4';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'icon';
}

export default function Logo({ 
  className = '', 
  showText = false, 
  size = 'md',
  variant = 'default'
}: LogoProps) {
  const sizeClasses = {
    sm: 'w-28 h-auto max-h-12',
    md: 'w-58 h-auto max-h-16',
    lg: 'w-64 h-auto max-h-24'
  };

  const textSizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-4xl'
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    // If the image fails to load, try alternative paths
    if (!target.dataset.retried) {
      target.dataset.retried = 'true';
      // Try alternative path
      target.src = '/yes/logo.png';
    } else if (!target.dataset.retried2) {
      target.dataset.retried2 = 'true';
      // Try without the folder
      target.src = '/logo.png';
    }
  };

  if (variant === 'icon') {
    return (
      <Link to="/" className={`flex items-center justify-center group ${className}`}>
        <div className={`${sizeClasses[size]} relative rounded-xl overflow-hidden bg-transparent`}>
          <img 
            src={logoImage} 
            alt="CIAR Logo" 
            className="w-full h-full object-contain drop-shadow-lg" 
            onError={handleImageError}
            loading="eager"
          />
        </div>
      </Link>
    );
  }

  if (variant === 'minimal') {
    return (
      <Link to="/" className={`flex items-center justify-center group ${className}`}>
        <div className={`${sizeClasses[size]} relative rounded-lg overflow-hidden bg-transparent flex items-center justify-center`}>
          <img 
            src={logoImage} 
            alt="CIAR Logo" 
            className="w-full h-full object-contain object-center drop-shadow-lg" 
            onError={handleImageError}
            loading="eager"
          />
        </div>
      </Link>
    );
  }

  return (
    <Link to="/" className={`inline-flex items-center group ${className}`}>
      <div className={`${sizeClasses[size]} relative rounded-xl overflow-hidden bg-transparent`}>
        <img 
          src={logoImage} 
          alt="CIAR Logo" 
          className="w-full h-full object-contain drop-shadow-lg" 
          onError={handleImageError}
          loading="eager"
        />
      </div>
    </Link>
  );
}

// Logo Icon Component
function LogoIcon() {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (!target.dataset.retried) {
      target.dataset.retried = 'true';
      target.src = '/yes/logo-CIAR-300x197.png';
    }
  };
  
  return (
    <div className="w-full h-full rounded-xl overflow-hidden bg-transparent">
      <img 
        src={logoImage} 
        alt="CIAR Logo" 
        className="w-full h-full object-contain drop-shadow-lg" 
        onError={handleImageError}
        loading="eager"
      />
    </div>
  );
}

// Alternative Logo Component with different design
export function LogoAlt({ className = '', showText = true }: LogoProps) {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (!target.dataset.retried) {
      target.dataset.retried = 'true';
      target.src = '/yes/logo-CIAR-300x197.png';
    }
  };
  
  return (
    <Link to="/" className={`inline-flex items-center group ${className}`}>
      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-transparent">
        <img 
          src={logoImage} 
          alt="CIAR Logo" 
          className="w-full h-full object-contain drop-shadow-lg" 
          onError={handleImageError}
          loading="eager"
        />
      </div>
    </Link>
  );
}

// Minimal Logo for compact spaces
export function LogoMinimal({ className = '' }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center justify-center group ${className}`}>
      <div className="w-10 h-10 bg-gradient-to-br from-tarhal-orange to-tarhal-orange-dark rounded-lg flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md">
        <svg
          viewBox="0 0 32 32"
          className="w-6 h-6 text-white"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" />
          <path
            d="M12 16 L20 12 L24 16 L20 20 L16 24 L12 20 Z"
            fill="currentColor"
            transform="rotate(-45 16 16)"
          />
        </svg>
      </div>
    </Link>
  );
}
