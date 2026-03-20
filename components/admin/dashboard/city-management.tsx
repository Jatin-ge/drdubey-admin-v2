"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

interface CityManagementProps {
  className?: string;
}

export const CityManagement = ({ className }: CityManagementProps) => {
  const [cities, setCities] = useState<string[]>([]);
  const [newCity, setNewCity] = useState("");
  const [editingCity, setEditingCity] = useState<{ original: string; edited: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [deleteCity, setDeleteCity] = useState<string | null>(null);

  const formatCityName = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();
  };

  const fetchCities = async () => {
    try {
      const response = await axios.get('/api/cities');
      setCities(response.data);
    } catch (error) {
      toast.error("Failed to fetch cities");
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCities();
    }
  }, [isOpen]);

  const handleAddCity = async () => {
    if (!newCity.trim()) return;

    try {
      setIsLoading(true);
      const formattedCity = formatCityName(newCity);
      
      // Check if city already exists in the current list
      if (cities.some(city => city.toLowerCase() === formattedCity.toLowerCase())) {
        toast.error(`"${formattedCity}" already exists in the list`);
        return;
      }

      const response = await axios.post('/api/cities', { cityName: formattedCity });
      
      if (response.data.exists) {
        toast.error(`"${formattedCity}" already exists in the database`);
        return;
      }

      await fetchCities();
      setNewCity("");
      toast.success(`"${formattedCity}" added successfully`);
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error(error.response.data.message || `City already exists`);
      } else {
        toast.error("Failed to add city");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCity = async (originalCity: string) => {
    if (!editingCity || !editingCity.edited.trim()) return;

    try {
      setIsLoading(true);
      const formattedCity = formatCityName(editingCity.edited);
      await axios.patch('/api/cities', { 
        oldName: originalCity,
        newName: formattedCity 
      });
      await fetchCities();
      setEditingCity(null);
      toast.success("City updated successfully");
    } catch (error) {
      toast.error("Failed to update city");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCity = async (cityName: string) => {
    try {
      setIsLoading(true);
      await axios.delete(`/api/cities?name=${cityName}`);
      await fetchCities();
      toast.success("City deleted successfully");
    } catch (error) {
      toast.error("Failed to delete city");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className={className}>
            Manage Cities
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md max-h-[85vh] p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>City Management</DialogTitle>
          </DialogHeader>

          <div className="px-6 py-4 space-y-4">
            {/* Add New City */}
            <div className="flex items-center gap-2 sticky top-0 bg-white">
              <Input
                placeholder="Enter new city name"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                className="h-9"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddCity();
                  }
                }}
              />
              <Button
                onClick={handleAddCity}
                disabled={isLoading || !newCity.trim()}
                size="sm"
                className="whitespace-nowrap shrink-0"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add City
              </Button>
            </div>

            {/* Cities Table */}
            <div className="border rounded-md overflow-hidden">
              <div className="max-h-[50vh] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-white">
                    <TableRow>
                      <TableHead className="w-full">City Name</TableHead>
                      <TableHead className="w-[100px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cities.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                          No cities found
                        </TableCell>
                      </TableRow>
                    ) : (
                      cities.map((city) => (
                        <TableRow key={city}>
                          <TableCell className="py-2">
                            {editingCity?.original === city ? (
                              <Input
                                value={editingCity.edited}
                                onChange={(e) => setEditingCity({ 
                                  original: city, 
                                  edited: e.target.value 
                                })}
                                className="h-8"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleEditCity(city);
                                  } else if (e.key === 'Escape') {
                                    setEditingCity(null);
                                  }
                                }}
                                autoFocus
                              />
                            ) : (
                              city
                            )}
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="flex items-center justify-end gap-1">
                              {editingCity?.original === city ? (
                                <>
                                  <Button
                                    onClick={() => handleEditCity(city)}
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    title="Save"
                                  >
                                    <Check className="h-4 w-4 text-green-500" />
                                  </Button>
                                  <Button
                                    onClick={() => setEditingCity(null)}
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    title="Cancel"
                                  >
                                    <X className="h-4 w-4 text-red-500" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    onClick={() => setEditingCity({ original: city, edited: city })}
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    title="Edit"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    onClick={() => setDeleteCity(city)}
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    title="Delete"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmationModal
        isOpen={!!deleteCity}
        onClose={() => setDeleteCity(null)}
        onConfirm={() => {
          if (deleteCity) {
            handleDeleteCity(deleteCity);
            setDeleteCity(null);
          }
        }}
        title="Delete City"
        description={`Are you sure you want to delete "${deleteCity}"? This action cannot be undone.`}
      />
    </>
  );
}; 