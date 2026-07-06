"use client";

import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import StaffKPIs from "../components/StaffKPIs";
import StaffFilters from "../components/StaffFilters";
import StaffTable from "../components/StaffTable";
import StaffFormModal from "../components/StaffFormModal";
import ViewStaffModal from "../components/ViewStaffModal";
import { 
  getStaffs, 
  getSingleStaff,
  createStaff, 
  updateStaff,
  deleteStaff, 
  updateStaffStatus,
  Staff, 
  CreateStaffPayload 
} from "../services/staff.service";
import styles from "../components/StaffComponents.module.css";

export default function StaffListPage() {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  
  const [selectedStaffForView, setSelectedStaffForView] = useState<Staff | null>(null);
  const [selectedStaffForEdit, setSelectedStaffForEdit] = useState<Staff | null>(null);

  const loadStaffs = () => {
    getStaffs()
      .then((data) => setStaffs(data))
      .catch((err) => console.error("Error loading staff:", err));
  };

  useEffect(() => {
    loadStaffs();
  }, []);

  const handleSaveStaff = (payload: CreateStaffPayload) => {
    createStaff(payload)
      .then(() => {
        setIsFormOpen(false);
        loadStaffs();
      })
      .catch((err) => console.error("Error creating staff:", err));
  };

  // എഡിറ്റ് ചെയ്യുമ്പോൾ ആദ്യം പ്രൊഫൈൽ വിവരങ്ങൾ അപ്ഡേറ്റ് ചെയ്ത ശേഷം PATCH സ്റ്റാറ്റസ് കോൾ ചെയ്യുന്നു (Chained Promises)
  const handleUpdateStaff = (id: number, payload: Partial<CreateStaffPayload>, updatedStatus?: boolean) => {
    updateStaff(id, payload)
      .then(() => {
        if (updatedStatus !== undefined) {
          // വിവരങ്ങൾ അപ്ഡേറ്റ് ചെയ്ത ശേഷം PATCH വഴി സ്റ്റാറ്റസ് അപ്ഡേറ്റ് ചെയ്യുന്നു
          return updateStaffStatus(id, updatedStatus);
        }
      })
      .then(() => {
        setIsFormOpen(false);
        setSelectedStaffForEdit(null);
        loadStaffs(); // ടേബിൾ വീണ്ടും ഫ്രെഷ് ഡാറ്റയുമായി റീലോഡ് ചെയ്യുന്നു
      })
      .catch((err) => console.error("Error updating staff & status:", err));
  };

  const handleDeleteStaff = (id: number) => {
    if (confirm("Are you sure you want to delete this staff?")) {
      deleteStaff(id)
        .then(() => loadStaffs())
        .catch((err) => console.error("Error deleting staff:", err));
    }
  };

  const handleViewClick = (id: number) => {
    getSingleStaff(id)
      .then((data) => {
        setSelectedStaffForView(data);
        setIsViewOpen(true);
      })
      .catch((err) => console.error("Error fetching single staff details:", err));
  };

  const handleEditClick = (staff: Staff) => {
    setSelectedStaffForEdit(staff);
    setIsFormOpen(true);
  };

  const handleToggleStatus = (id: number, currentStatus: boolean) => {
    updateStaffStatus(id, !currentStatus)
      .then(() => loadStaffs())
      .catch((err) => console.error("Error patching staff status:", err));
  };

  const filteredStaffs = staffs.filter((s) =>
    s.staff_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Total Staff</h1>
        <Button 
          variant="primary" 
          onClick={() => {
            setSelectedStaffForEdit(null);
            setIsFormOpen(true);
          }}
        >
          <Plus size={16} /> Add New Staff
        </Button>
      </div>

      <StaffKPIs totalStaff={staffs.length} />

      <StaffFilters searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <StaffTable 
        staffs={filteredStaffs} 
        onDelete={handleDeleteStaff} 
        onViewClick={handleViewClick}
        onEditClick={handleEditClick}
        onToggleStatus={handleToggleStatus}
      />

      <StaffFormModal 
        isOpen={isFormOpen} 
        onClose={() => {
          setIsFormOpen(false);
          setSelectedStaffForEdit(null);
        }} 
        onSave={handleSaveStaff}
        onUpdate={handleUpdateStaff}
        editStaff={selectedStaffForEdit}
      />

      <ViewStaffModal 
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedStaffForView(null);
        }}
        staff={selectedStaffForView}
      />
    </div>
  );
}