// components/ui/pagination.tsx
"use client"

import { Button } from "./button"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showIcons?: boolean
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  showIcons = true
}: PaginationProps) {
  const renderPageButton = (page: number, isActive = false) => (
    <Button
      key={page}
      variant={isActive ? "default" : "outline"}
      size="icon"
      onClick={() => onPageChange(page)}
      disabled={isActive}
    >
      {page}
    </Button>
  )

  const renderEllipsis = (key: string) => (
    <Button
      key={key}
      variant="outline"
      size="icon"
      disabled
    >
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  )

  const renderPageButtons = () => {
    const pages = []
    
    // Always show first page
    pages.push(renderPageButton(1, currentPage === 1))
    
    // Show ellipsis if current page is more than 3
    if (currentPage > 3) {
      pages.push(renderEllipsis('ellipsis-1'))
    }
    
    // Add page before current if it exists and is not the first page
    if (currentPage > 2) {
      pages.push(renderPageButton(currentPage - 1))
    }
    
    // Add current page if it's not the first or last
    if (currentPage !== 1 && currentPage !== totalPages) {
      pages.push(renderPageButton(currentPage, true))
    }
    
    // Add page after current if it exists and is not the last page
    if (currentPage < totalPages - 1) {
      pages.push(renderPageButton(currentPage + 1))
    }
    
    // Show ellipsis if current page is less than totalPages - 2
    if (currentPage < totalPages - 2) {
      pages.push(renderEllipsis('ellipsis-2'))
    }
    
    // Always show last page if there's more than one page
    if (totalPages > 1) {
      pages.push(renderPageButton(totalPages, currentPage === totalPages))
    }
    
    return pages
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-500">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center space-x-2">
        {showIcons && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        
        <div className="flex items-center space-x-2">
          {renderPageButtons()}
        </div>
        
        {showIcons && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}