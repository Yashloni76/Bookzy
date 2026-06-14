"use client";

import { useState } from "react";
import { Plus, Edit2, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { 
  addServiceAction, 
  updateServiceAction, 
  toggleServiceStatusAction
} from "@/app/(dashboard)/dashboard/services/actions";

type Service = {
  id: string;
  name: string;
  duration_minutes: number;
  price: number | null;
  is_active: boolean;
};

export function ServicesList({ initialServices }: { initialServices: Service[] }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await addServiceAction(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setIsAddOpen(false);
    }
    setIsLoading(false);
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingService) return;

    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await updateServiceAction(editingService.id, formData);

    if (result.error) {
      setError(result.error);
    } else {
      setIsEditOpen(false);
      setEditingService(null);
    }
    setIsLoading(false);
  };

  const openEdit = (service: Service) => {
    setEditingService(service);
    setIsEditOpen(true);
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    await toggleServiceStatusAction(id, !currentStatus);
  };



  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Services</h1>
          <p className="text-slate-500 mt-1">Manage what you offer to your clients.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> Add Service
        </Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {initialServices.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No services found. Add one to get started!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {initialServices.map((service) => (
                  <tr key={service.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {service.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {service.duration_minutes} mins
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {service.price ? `₹${service.price}` : "Free / Varies"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                        service.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                      }`}>
                        {service.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-slate-400 hover:text-blue-700"
                          onClick={() => toggleStatus(service.id, service.is_active)}
                          title={service.is_active ? "Deactivate" : "Activate"}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-slate-400 hover:text-blue-700"
                          onClick={() => openEdit(service)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogHeader>
          <DialogTitle>Add New Service</DialogTitle>
          <DialogDescription>Create a new service offering for your clients.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAdd}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Service Name</Label>
              <Input id="name" name="name" required placeholder="e.g. Haircut" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input id="duration" name="duration" type="number" required min="5" step="5" defaultValue={30} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) (Optional)</Label>
              <Input id="price" name="price" type="number" min="0" placeholder="Leave empty if free" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Add Service"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogHeader>
          <DialogTitle>Edit Service</DialogTitle>
          <DialogDescription>Update the details of your service.</DialogDescription>
        </DialogHeader>
        {editingService && (
          <form onSubmit={handleEdit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Service Name</Label>
                <Input id="edit-name" name="name" required defaultValue={editingService.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-duration">Duration (minutes)</Label>
                <Input id="edit-duration" name="duration" type="number" required min="5" step="5" defaultValue={editingService.duration_minutes} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price (₹) (Optional)</Label>
                <Input id="edit-price" name="price" type="number" min="0" defaultValue={editingService.price ?? ""} />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </Dialog>
    </div>
  );
}
