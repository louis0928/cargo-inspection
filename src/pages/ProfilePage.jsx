/* eslint-disable react/prop-types */
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { DialogFooter } from "@/components/ui/dialog";
import { Check, Pencil, User, Users, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import useAuth from "@/hooks/useAuth";

export function ProfilePage() {
  const [site, setSite] = useState("MD");
  const [profiles, setProfiles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteUser, setDeleteUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { auth } = useAuth();

  // Fetch profiles when site changes
  useEffect(() => {
    fetchProfiles();
  }, [site]);

  const fetchProfiles = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `https://integration.eastlandfood.com/efc/cargo-inspection/profiles/${site}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
          },
          withCredentials: true,
        }
      );
      setProfiles(res.data);
    } catch (err) {
      console.error("Error fetching profiles", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleEditSave = async (updatedUser) => {
    setIsLoading(true);
    try {
      await axios.patch(
        `https://integration.eastlandfood.com/efc/cargo-inspection/profile`,
        updatedUser,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
          },
          withCredentials: true,
        }
      );
      await fetchProfiles();
    } catch (err) {
      console.error("Error updating user", err);
    } finally {
      setIsLoading(false);
      setIsEditModalOpen(false);
    }
  };

  const handleCreateSave = async (newUser) => {
    setIsLoading(true);
    try {
      // Assuming POST to the profiles endpoint for the given site
      await axios.post(
        `https://integration.eastlandfood.com/efc/cargo-inspection/profile`,
        newUser,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
          },
          withCredentials: true,
        }
      );
      await fetchProfiles();
    } catch (err) {
      console.error("Error creating user", err);
    } finally {
      setIsLoading(false);
      setIsCreateModalOpen(false);
    }
  };

  const handleDeleteClick = (user) => {
    setDeleteUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async (userId) => {
    setIsLoading(true);
    try {
      await axios.delete(
        `https://integration.eastlandfood.com/efc/cargo-inspection/profile/${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
          },
          withCredentials: true,
        }
      );
      await fetchProfiles();
    } catch (err) {
      console.error("Error deleting user", err);
    } finally {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  function DeleteUserModal({ user, open, onClose, onConfirm }) {
    // If there's no user selected, don't render the modal at all
    if (!user) return null;

    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete User Profile</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this profile? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {/* Display user information */}
          <div className="space-y-2 mt-2">
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Loader:</strong> {user.isLoader === 1 ? "Yes" : "No"}
            </p>
            <p>
              <strong>Merger:</strong> {user.isMerger === 1 ? "Yes" : "No"}
            </p>
            <p>
              <strong>Checker:</strong> {user.isChecker === 1 ? "Yes" : "No"}
            </p>
            <p>
              <strong>Inspector:</strong> {user.isInspector === 1 ? "Yes" : "No"}
            </p>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {/* Call onConfirm with user.user_id when the user confirms */}
            <Button variant="destructive" onClick={() => onConfirm(user.user_id)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 mt-10">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-slate-100 to-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <CardTitle>User Profiles</CardTitle>
          </div>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <div className="flex items-center gap-4">
              <Label htmlFor="site-select" className="font-medium">
                Site:
              </Label>
              <Select value={site} onValueChange={setSite}>
                <SelectTrigger id="site-select" className="w-[180px]">
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MD">Maryland (MD)</SelectItem>
                  <SelectItem value="SC">South Carolina (SC)</SelectItem>
                  <SelectItem value="IL">Illinois (IL)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              {profiles.length} users found
            </div>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create Profile
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[40%]">Name</TableHead>
                  <TableHead className="text-center">Loader</TableHead>
                  <TableHead className="text-center">Merger</TableHead>
                  <TableHead className="text-center">Checker</TableHead>
                  <TableHead className="text-center">Inspector</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No users found for this site
                    </TableCell>
                  </TableRow>
                ) : (
                  profiles.map((user) => (
                    <TableRow
                      key={user.user_id}
                      className="transition-colors hover:bg-muted/50"
                    >
                      <TableCell className="p-2">
                        <div className="w-full h-full flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="flex-1 h-full flex items-center">
                            {user.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="p-2 text-center">
                        {user.isLoader === 1 ? (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200 h-full flex items-center justify-center"
                          >
                            <Check className="h-3 w-3 mr-1" /> Yes
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm flex items-center justify-center h-full">
                            No
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="p-2 text-center">
                        {user.isMerger === 1 ? (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200 h-full flex items-center justify-center"
                          >
                            <Check className="h-3 w-3 mr-1" /> Yes
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm flex items-center justify-center h-full">
                            No
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="p-2 text-center">
                        {user.isChecker === 1 ? (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200 h-full flex items-center justify-center"
                          >
                            <Check className="h-3 w-3 mr-1" /> Yes
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm flex items-center justify-center h-full">
                            No
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="p-2 text-center">
                        {user.isInspector === 1 ? (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200 h-full flex items-center justify-center"
                          >
                            <Check className="h-3 w-3 mr-1" /> Yes
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm flex items-center justify-center h-full">
                            No
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="p-2 text-center">
                        <div className="grid grid-cols-2 gap-2 w-full">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(user);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(user);
                            }}
                          >
                            <Trash className="h-3.5 w-3.5 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleEditSave}
        />
      )}

      {/* Create User Modal */}
      <CreateUserModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateSave}
        site={site}
      />

      <DeleteUserModal
        user={deleteUser}
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Loading Overlay */}
      <LoadingOverlayComponent
        isLoading={isLoading}
        text="Processing request..."
      />
    </div>
  );
}

// Edit User Modal (for updating an existing user)
function EditUserModal({ user, open, onClose, onSave }) {
  const [formData, setFormData] = useState(user);

  useEffect(() => {
    // Whenever the passed user changes, update the formData
    setFormData(user);
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User Profile</DialogTitle>
          <DialogDescription>
            Update user information and role assignments
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter user's full name"
              />
            </div>
            <div className="space-y-4 pt-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Role Assignments
              </h4>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isLoader"
                  name="isLoader"
                  checked={formData.isLoader === 1}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      isLoader: checked ? 1 : 0,
                    }))
                  }
                />
                <Label htmlFor="isLoader" className="text-sm font-normal">
                  Loader – Can load cargo and manage loading operations
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isMerger"
                  name="isMerger"
                  checked={formData.isMerger === 1}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      isMerger: checked ? 1 : 0,
                    }))
                  }
                />
                <Label htmlFor="isMerger" className="text-sm font-normal">
                  Merger – Can merge and consolidate shipments
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isChecker"
                  name="isChecker"
                  checked={formData.isChecker === 1}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      isChecker: checked ? 1 : 0,
                    }))
                  }
                />
                <Label htmlFor="isChecker" className="text-sm font-normal">
                  Checker – Can verify and check cargo details
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isInspector"
                  name="isInspector"
                  checked={formData.isInspector === 1}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      isInspector: checked ? 1 : 0,
                    }))
                  }
                />
                <Label htmlFor="isInspector" className="text-sm font-normal">
                  Inspector – Inspect cargo and fill in form
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Create User Modal (for creating a new user)
function CreateUserModal({ open, onClose, onSave, site }) {
  // Start with empty fields. You can prefill site automatically.
  const [formData, setFormData] = useState({
    name: "",
    site: site,
    isLoader: 0,
    isMerger: 0,
    isChecker: 0,
    isInspector: 0,
  });

  // Update site field if site prop changes.
  useEffect(() => {
    setFormData((prev) => ({ ...prev, site }));
  }, [site]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you might add validation if needed
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create User Profile</DialogTitle>
          <DialogDescription>
            Enter user details and assign roles
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name-create">Full Name</Label>
              <Input
                id="name-create"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter user's full name"
              />
            </div>
            {/* Optionally include a site selector if you want users to choose a different site */}
            <div className="grid gap-2">
              <Label htmlFor="site-create">Site</Label>
              <Select
                value={formData.site}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, site: value }))
                }
              >
                <SelectTrigger id="site-create" className="w-[180px]">
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MD">Maryland (MD)</SelectItem>
                  <SelectItem value="SC">South Carolina (SC)</SelectItem>
                  <SelectItem value="IL">Illinois (IL)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4 pt-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Role Assignments
              </h4>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isLoader-create"
                  name="isLoader"
                  checked={formData.isLoader === 1}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      isLoader: checked ? 1 : 0,
                    }))
                  }
                />
                <Label
                  htmlFor="isLoader-create"
                  className="text-sm font-normal"
                >
                  Loader – Can load cargo and manage loading operations
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isMerger-create"
                  name="isMerger"
                  checked={formData.isMerger === 1}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      isMerger: checked ? 1 : 0,
                    }))
                  }
                />
                <Label
                  htmlFor="isMerger-create"
                  className="text-sm font-normal"
                >
                  Merger – Can merge and consolidate shipments
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isChecker-create"
                  name="isChecker"
                  checked={formData.isChecker === 1}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      isChecker: checked ? 1 : 0,
                    }))
                  }
                />
                <Label
                  htmlFor="isChecker-create"
                  className="text-sm font-normal"
                >
                  Checker – Can verify and check cargo details
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isInspector-create"
                  name="isInspector"
                  checked={formData.isInspector === 1}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      isInspector: checked ? 1 : 0,
                    }))
                  }
                />
                <Label
                  htmlFor="isInspector-create"
                  className="text-sm font-normal"
                >
                  Inspector – Inspect Cargo and fill in form
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Profile</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Loading Overlay Component
function LoadingOverlayComponent({ isLoading, text = "Loading..." }) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg flex flex-col items-center">
        <div className="h-10 w-10 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-center text-blue-500 font-semibold">{text}</p>
      </div>
    </div>
  );
}
