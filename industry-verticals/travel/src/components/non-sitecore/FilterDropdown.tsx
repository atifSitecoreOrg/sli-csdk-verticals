'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shadcn/components/ui/dropdown-menu';
import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type FilterOption = {
  label: string;
  value: string;
  id: string;
};

type FilterDropdownProps = {
  options: FilterOption[];
  selectedValues?: string[];
  placeholder: string;
  onToggle: (value: string) => void;
};

/**
 * Multi-select dropdown used by destination listing filters.
 */
const FilterDropdown = ({
  options,
  selectedValues = [],
  placeholder,
  onToggle,
}: FilterDropdownProps) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [triggerWidth, setTriggerWidth] = useState<number>(0);

  useEffect(() => {
    if (triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          ref={triggerRef}
          type="button"
          className={`border-border inline-flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-4 py-1 text-xs whitespace-nowrap shadow-xs focus:outline-none ${
            selectedValues.length > 0 ? 'text-foreground' : 'text-foreground-muted'
          }`}
        >
          <span>{placeholder}</span>{' '}
          <div className="flex items-center gap-2">
            {selectedValues.length > 0 && (
              <span className="bg-accent/20 text-accent ml-1 rounded-full px-2 py-0.5 text-xs font-bold">
                {selectedValues.length}
              </span>
            )}
            <ChevronDown size={16} className="text-foreground-muted shrink-0" />
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" style={{ minWidth: `${triggerWidth}px` }}>
        <div className="flex w-full flex-col space-y-1">
          {options.map((option) => {
            const isSelected = selectedValues.includes(option.value);

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onToggle(option.value)}
                className="hover:bg-foreground-muted/10 flex cursor-pointer items-center px-1 py-1 text-xs"
              >
                <span className="flex h-4 w-4 flex-none items-center justify-center rounded border">
                  {isSelected && <Check className="text-accent size-3" strokeWidth={4} />}
                </span>
                <span className="ms-2 flex-1 text-left">{option.label}</span>
              </button>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterDropdown;
