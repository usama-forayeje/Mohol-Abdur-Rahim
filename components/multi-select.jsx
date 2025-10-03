"use client";

import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

export function MultiSelect({
  options,
  value = [],
  onValueChange,
  placeholder = "Select options...",
  className,
  ...props
}) {
  const [open, setOpen] = React.useState(false);

  const selectedLabels = options
    .filter(option => value.includes(option.value))
    .map(option => option.label);

  const handleToggleOption = (optionValue) => {
    const isSelected = value.includes(optionValue);
    if (isSelected) {
      onValueChange(value.filter(v => v !== optionValue));
    } else {
      onValueChange([...value, optionValue]);
    }
  };

  const handleRemoveOption = (optionValue, e) => {
    e.stopPropagation();
    onValueChange(value.filter(v => v !== optionValue));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between min-h-10",
            selectedLabels.length === 0 && "text-muted-foreground",
            className
          )}
          {...props}
        >
          <div className="flex flex-wrap gap-1 flex-1 text-left">
            {selectedLabels.length > 0 ? (
              selectedLabels.slice(0, 2).map((label) => {
                const option = options.find(opt => opt.label === label);
                return (
                  <Badge key={label} variant="secondary" className="text-xs">
                    {label}
                    <button
                      className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onClick={(e) => handleRemoveOption(option?.value, e)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })
            ) : (
              <span>{placeholder}</span>
            )}
            {selectedLabels.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{selectedLabels.length - 2} more
              </Badge>
            )}
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <div className="p-2">
          <div className="space-y-2 max-h-64 overflow-auto">
            {options.map((option) => (
              <div
                key={option.value}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                onClick={() => handleToggleOption(option.value)}
              >
                <Checkbox
                  checked={value.includes(option.value)}
                  onChange={() => {}}
                  className="flex-shrink-0"
                />
                <span className="flex-1 text-sm">{option.label}</span>
                {value.includes(option.value) && (
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
          {options.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-4">
              No options available
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}