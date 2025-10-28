import { TrendDataPoint } from '@/lib/mockData';

interface TrendChartProps {
  data: TrendDataPoint[];
  height?: number;
  color?: string;
  showDots?: boolean;
  showGrid?: boolean;
  title?: string;
}

export function TrendChart({
  data,
  height = 200,
  color = '#10b981',
  showDots = true,
  showGrid = true,
  title,
}: TrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500">
        No data available
      </div>
    );
  }

  const width = 100; // Use percentage
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };

  // Calculate min and max values for scaling
  const values = data.map((d) => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1;

  // Scale functions
  const scaleX = (index: number) => {
    return (index / (data.length - 1)) * (100 - padding.left - padding.right) + padding.left;
  };

  const scaleY = (value: number) => {
    return (
      100 -
      padding.bottom -
      ((value - minValue) / valueRange) * (100 - padding.top - padding.bottom)
    );
  };

  // Generate path for line chart
  const linePath = data
    .map((point, i) => {
      const x = scaleX(i);
      const y = scaleY(point.value);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // Generate path for area fill
  const areaPath = `
    ${linePath}
    L ${scaleX(data.length - 1)} ${100 - padding.bottom}
    L ${scaleX(0)} ${100 - padding.bottom}
    Z
  `;

  // Grid lines
  const gridLines = showGrid ? [0, 25, 50, 75, 100] : [];

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-sm font-medium text-zinc-400 mb-4">{title}</h3>
      )}
      <div className="relative" style={{ height: `${height}px` }}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Grid lines */}
          {showGrid &&
            gridLines.map((y) => (
              <line
                key={y}
                x1={padding.left}
                y1={y}
                x2={100 - padding.right}
                y2={y}
                stroke="#3f3f46"
                strokeWidth="0.2"
                strokeDasharray="1,1"
              />
            ))}

          {/* Area fill */}
          <path
            d={areaPath}
            fill={color}
            fillOpacity="0.1"
          />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dots */}
          {showDots &&
            data.map((point, i) => (
              <circle
                key={i}
                cx={scaleX(i)}
                cy={scaleY(point.value)}
                r="0.8"
                fill={color}
                className="hover:r-1.5 transition-all"
              />
            ))}
        </svg>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-zinc-500 pr-2" style={{ width: `${padding.left}px` }}>
          <span>{maxValue.toFixed(0)}</span>
          <span>{((maxValue + minValue) / 2).toFixed(0)}</span>
          <span>{minValue.toFixed(0)}</span>
        </div>

        {/* X-axis labels */}
        <div className="flex justify-between text-xs text-zinc-500 mt-2">
          {data.filter((_, i) => i % Math.ceil(data.length / 6) === 0).map((point, i) => (
            <span key={i}>{point.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
