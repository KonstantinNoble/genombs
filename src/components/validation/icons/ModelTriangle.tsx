import { cn } from "@/lib/utils";
import { AVAILABLE_MODELS } from "../ModelSelector";

interface ModelTriangleProps {
  models: string[];
  modelWeights?: Record<string, number>;
  className?: string;
  size?: number;
}

export function ModelTriangle({ models, modelWeights, className = "", size = 120 }: ModelTriangleProps) {
  // Position nodes in a triangle
  const positions = [
    { x: 50, y: 15 },  // Top
    { x: 15, y: 75 },  // Bottom left
    { x: 85, y: 75 },  // Bottom right
  ];

  // For 2 models, use horizontal layout
  const twoModelPositions = [
    { x: 25, y: 50 },
    { x: 75, y: 50 },
  ];

  const activePositions = models.length === 2 ? twoModelPositions : positions;

  // Get model color
  const getModelColor = (modelKey: string) => {
    const model = AVAILABLE_MODELS[modelKey];
    if (!model) return "#888";
    
    // Extract color from colorClass
    if (model.colorClass?.includes("emerald")) return "#10b981";
    if (model.colorClass?.includes("orange")) return "#f97316";
    if (model.colorClass?.includes("purple")) return "#a855f7";
    if (model.colorClass?.includes("blue")) return "#3b82f6";
    if (model.colorClass?.includes("cyan")) return "#06b6d4";
    return "#888";
  };

  // Calculate node size based on weight
  const getNodeSize = (modelKey: string) => {
    const weight = modelWeights?.[modelKey] || 33;
    // Scale from 8 to 16 based on weight (0-100)
    return 8 + (weight / 100) * 8;
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={cn("overflow-visible", className)}
    >
      {/* Connection lines */}
      {models.length >= 2 && (
        <>
          <line
            x1={activePositions[0].x}
            y1={activePositions[0].y}
            x2={activePositions[1].x}
            y2={activePositions[1].y}
            stroke="currentColor"
            strokeOpacity="0.2"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
          {models.length >= 3 && (
            <>
              <line
                x1={activePositions[1].x}
                y1={activePositions[1].y}
                x2={activePositions[2].x}
                y2={activePositions[2].y}
                stroke="currentColor"
                strokeOpacity="0.2"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
              <line
                x1={activePositions[2].x}
                y1={activePositions[2].y}
                x2={activePositions[0].x}
                y2={activePositions[0].y}
                stroke="currentColor"
                strokeOpacity="0.2"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
            </>
          )}
        </>
      )}

      {/* Center synthesis point */}
      <circle
        cx="50"
        cy="50"
        r="6"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="1.5"
        className="animate-pulse"
      />
      <circle
        cx="50"
        cy="50"
        r="2"
        fill="currentColor"
      />

      {/* Lines to center */}
      {models.map((modelKey, i) => {
        const pos = activePositions[i];
        if (!pos) return null;
        
        return (
          <line
            key={`line-${modelKey}`}
            x1={pos.x}
            y1={pos.y}
            x2="50"
            y2="50"
            stroke={getModelColor(modelKey)}
            strokeOpacity="0.4"
            strokeWidth="1.5"
          />
        );
      })}

      {/* Model nodes */}
      {models.map((modelKey, i) => {
        const pos = activePositions[i];
        if (!pos) return null;
        
        const color = getModelColor(modelKey);
        const nodeSize = getNodeSize(modelKey);
        const model = AVAILABLE_MODELS[modelKey];
        
        return (
          <g key={modelKey}>
            {/* Glow */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={nodeSize + 4}
              fill={color}
              fillOpacity="0.15"
            />
            {/* Node */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={nodeSize}
              fill={color}
              fillOpacity="0.3"
              stroke={color}
              strokeWidth="2"
            />
            {/* Label */}
            <text
              x={pos.x}
              y={pos.y + nodeSize + 12}
              textAnchor="middle"
              fontSize="8"
              fill="currentColor"
              fillOpacity="0.7"
            >
              {model?.name.split(' ')[0] || modelKey}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
