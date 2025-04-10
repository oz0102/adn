import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterBarProps {
  onSearch?: (value: string) => void;
  onFilter?: (key: string, value: string) => void;
  filters?: Array<{
    key: string;
    label: string;
    options: Array<{
      label: string;
      value: string;
    }>;
  }>;
  searchPlaceholder?: string;
  className?: string;
  children?: React.ReactNode;
}

export function FilterBar({
  onSearch,
  onFilter,
  filters = [],
  searchPlaceholder = "Search...",
  className,
  children,
}: FilterBarProps) {
  const [searchValue, setSearchValue] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchValue);
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-3 mb-6 ${className}`}>
      <form onSubmit={handleSearch} className="flex-1 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            className="pl-8 w-full"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        <Button type="submit" variant="secondary">Search</Button>
      </form>
      
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Select 
            key={filter.key} 
            onValueChange={(value) => onFilter && onFilter(filter.key, value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All {filter.label}</SelectItem>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
        
        {children}
      </div>
    </div>
  );
}
