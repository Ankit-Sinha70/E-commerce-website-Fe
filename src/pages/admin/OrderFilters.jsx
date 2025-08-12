// src/pages/admin/OrderFilters.jsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, FileText, Filter, RotateCw, Search, X } from "lucide-react";

const statusOptions = [
  "All",
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const OrderFilters = ({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterDate,
  setFilterDate,
  showFilters,
  setShowFilters,
  onSearch,
  onReset,
}) => (
  <div className="mb-6 space-y-4 text-slate-300">
    {/* Search Bar */}

    {/* Desktop Filters */}
    <div className="w-full space-y-4">
      {/* Filters & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        {/* Search */}
        <div className="flex flex-1 max-w-full">
          <Input
            type="text"
            placeholder="Search by customer name"
            className="rounded-r-none border-r-0 w-full bg-gray-800 text-white border-gray-700 shadow-md focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
          />
          <Button
            onClick={onSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-l-none shadow-md"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Search</span>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 flex-wrap lg:flex-nowrap">
          {/* Status */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Status
            </label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full border border-gray-700 rounded-md px-3 py-2 bg-gray-800 text-white shadow-md">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 text-white">
                {statusOptions.map((status) => (
                  <SelectItem
                    key={status}
                    value={status}
                    className="hover:bg-gray-600"
                  >
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Date
            </label>
            <div className="relative">
              <Input
                type="date"
                className="w-full border border-gray-700 rounded-md px-3 py-2 pr-10 bg-gray-800 text-white shadow-md focus:ring-blue-500 focus:border-blue-500"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
            </div>
          </div>

          {/* Reset */}
          <div className="flex items-end">
            <Button
              onClick={onReset}
              className="bg-yellow-500 hover:bg-yellow-600 text-white w-full shadow-md"
            >
              <RotateCw className=" h-4 w-4" />
              Reset
            </Button>
          </div>

          {/* Export */}
          {/* <div className="flex items-end">
            <Button
              onClick={() => alert("Export to PDF not implemented")}
              className="bg-green-600 hover:bg-green-700 text-white w-full"
            >
              <FileText className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div> */}
        </div>
      </div>
    </div>

    {/* Mobile Filters */}
    {showFilters && (
      <div className="sm:hidden bg-gray-800 p-4 rounded-lg space-y-4 border border-gray-700 shadow-md">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-white">Filters</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1">
              Status
            </label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white shadow-md">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 text-white">
                {statusOptions.map((status) => (
                  <SelectItem
                    key={status}
                    value={status}
                    className="hover:bg-gray-600"
                  >
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1">
              Date
            </label>
            <Input
              type="date"
              className="w-full border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white shadow-md"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={onReset}
              variant="outline"
              className="flex-1 text-gray-300 shadow-md"
            >
              <RotateCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button
              onClick={() => alert("Export to PDF not implemented")}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-md"
            >
              <FileText className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>
    )}
  </div>
);

export default OrderFilters;
