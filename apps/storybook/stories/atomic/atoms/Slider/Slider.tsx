import { forwardRef, InputHTMLAttributes } from "react";
import clsx from "clsx";

type SliderSize = "sm" | "md" | "lg";

export interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type" | "value" | "onChange"> {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  formatValue?: (value: number) => string;
  showValue?: boolean;
  sliderSize?: SliderSize;
  fullWidth?: boolean;
}

const trackSizeClasses: Record<SliderSize, string> = {
  sm: "h-1 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3",
  md: "h-1.5 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4",
  lg: "h-2 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5",
};

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      value,
      min = 0,
      max = 100,
      step = 1,
      onChange,
      formatValue = (v) => `${v}`,
      showValue = true,
      sliderSize = "md",
      fullWidth = false,
      disabled = false,
      className,
      ...props
    },
    ref,
  ) => {
    const percentage = max === min ? 0 : ((value - min) / (max - min)) * 100;

    return (
      <div className={clsx(fullWidth ? "w-full" : "w-auto")}>
        {showValue && (
          <div className="relative mb-1 h-6" aria-hidden="true">
            <span
              className={clsx(
                "absolute -translate-x-1/2 rounded-md bg-gray-900 px-2 py-0.5",
                "text-xs font-semibold whitespace-nowrap text-white",
                disabled && "bg-gray-400",
              )}
              style={{ left: `${percentage}%` }}
            >
              {formatValue(value)}
            </span>
          </div>
        )}

        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange?.(Number(event.target.value))}
          aria-valuetext={formatValue(value)}
          className={clsx(
            "block cursor-pointer appearance-none rounded-full bg-gray-200 outline-none",
            "transition-colors duration-200",
            "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full",
            "[&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:transition-colors",
            "[&::-webkit-slider-thumb]:hover:bg-blue-700",
            "[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full",
            "[&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-blue-600",
            "[&::-moz-range-thumb]:hover:bg-blue-700",
            trackSizeClasses[sliderSize],
            fullWidth ? "w-full" : "w-48",
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);

Slider.displayName = "Slider";
