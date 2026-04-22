import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, formatINR } from "@/lib/utils";

export interface ProductVariant {
  variantId?: string;
  _id?: string;
  configuration: string;
  finish: string;
  stock: number;
  sku: string;
  price?: number;
  images?: string[];
}

interface VariantSelectorProps {
  variants: ProductVariant[];
  basePrice: number;
  selectedConfiguration: string | null;
  selectedFinish: string | null;
  selectedVariant: ProductVariant | null;
  onConfigurationChange: (configuration: string) => void;
  onFinishChange: (finish: string) => void;
}

const getUniqueValues = (values: string[]): string[] =>
  Array.from(new Set(values.filter(Boolean)));

const finishColorMap: Record<string, string> = {
  sunburst: "bg-amber-700",
  natural: "bg-yellow-100",
  "gloss black": "bg-black",
  "matte white": "bg-white",
  "cherry red": "bg-red-700",
  black: "bg-black",
  white: "bg-white",
  red: "bg-red-600",
  blue: "bg-blue-700",
};

const getFinishColorClass = (finish: string): string =>
  finishColorMap[finish.trim().toLowerCase()] ?? "bg-stone-300";

const getVariantId = (variant: ProductVariant): string =>
  variant.variantId ?? variant._id ?? variant.sku;

const getStockLabel = (stock: number): { label: string; className: string; dot: string } => {
  if (stock >= 5) {
    return { label: "In Stock", className: "text-green-600", dot: "bg-green-500" };
  }

  if (stock > 0) {
    return { label: `Only ${stock} left`, className: "text-orange-600", dot: "bg-orange-500" };
  }

  return { label: "Out of Stock", className: "text-red-500", dot: "bg-red-500" };
};

const VariantSelector = ({
  variants,
  basePrice,
  selectedConfiguration,
  selectedFinish,
  selectedVariant,
  onConfigurationChange,
  onFinishChange,
}: VariantSelectorProps) => {
  const validVariants = variants.filter(
    (variant) => variant.configuration && variant.finish && variant.sku
  );
  const configurations = getUniqueValues(validVariants.map((variant) => variant.configuration));
  const finishes = getUniqueValues(validVariants.map((variant) => variant.finish));
  const selectedStock = selectedVariant ? getStockLabel(selectedVariant.stock) : null;
  const variantPrice = selectedVariant?.price;
  const hasPriceDelta = variantPrice !== undefined && variantPrice !== basePrice;
  const priceDelta = hasPriceDelta ? variantPrice - basePrice : 0;
  const hasSelection = Boolean(selectedConfiguration && selectedFinish);
  const combinationUnavailable = hasSelection && !selectedVariant;

  const hasAvailableConfiguration = (configuration: string): boolean =>
    validVariants.some((variant) => variant.configuration === configuration && variant.stock > 0);

  const hasAvailableFinish = (finish: string): boolean =>
    validVariants.some((variant) => {
      const matchesFinish = variant.finish === finish;
      const matchesConfiguration = selectedConfiguration
        ? variant.configuration === selectedConfiguration
        : true;
      return matchesFinish && matchesConfiguration && variant.stock > 0;
    });

  if (validVariants.length === 0) {
    return (
      <div className="mb-8 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
        No selectable variants are available for this instrument.
      </div>
    );
  }

  return (
    <div className="mb-8 space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-900">
          Configuration
        </h3>
        <div className="flex flex-wrap gap-2">
          {configurations.map((configuration) => {
            const disabled = !hasAvailableConfiguration(configuration);
            const selected = selectedConfiguration === configuration;

            return (
              <Button
                key={configuration}
                type="button"
                variant={selected ? "default" : "outline"}
                disabled={disabled}
                onClick={() => onConfigurationChange(configuration)}
                className={cn(
                  "h-10 rounded-full px-4 shadow-none transition-all hover:shadow-md",
                  selected && "bg-gray-900 text-white hover:bg-gray-800",
                  disabled && "cursor-not-allowed opacity-40"
                )}
              >
                {configuration}
              </Button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-900">
          Finish
        </h3>
        <TooltipProvider delayDuration={120}>
          <div className="flex flex-wrap gap-3">
            {finishes.map((finish) => {
              const disabled = !hasAvailableFinish(finish);
              const selected = selectedFinish === finish;

              return (
                <Tooltip key={finish}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label={finish}
                      disabled={disabled}
                      onClick={() => onFinishChange(finish)}
                      className={cn(
                        "h-10 w-10 rounded-full border border-gray-300 transition-all hover:shadow-md",
                        getFinishColorClass(finish),
                        selected && "border-gray-950 ring-2 ring-gray-950 ring-offset-2",
                        disabled && "cursor-not-allowed opacity-35"
                      )}
                    />
                  </TooltipTrigger>
                  <TooltipContent>{finish}</TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </div>

      <div className="min-h-[52px] rounded-lg bg-gray-50 px-4 py-3">
        {combinationUnavailable ? (
          <Alert className="border-amber-200 bg-amber-50 text-amber-900">
            <AlertDescription>
              No in-stock variant matches the selected configuration and finish.
            </AlertDescription>
          </Alert>
        ) : selectedVariant && selectedStock ? (
          <div className="space-y-1 text-sm">
            <div className={cn("inline-flex items-center gap-1.5 font-medium", selectedStock.className)}>
              <span className={cn("h-2 w-2 rounded-full", selectedStock.dot)} />
              {selectedStock.label}
            </div>
            {hasPriceDelta && (
              <p className="font-medium text-gray-900">
                {priceDelta > 0 ? "+" : "-"}
                {formatINR(Math.abs(priceDelta))} for this variant
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Select a configuration and finish.</p>
        )}
      </div>
    </div>
  );
};

export default VariantSelector;
