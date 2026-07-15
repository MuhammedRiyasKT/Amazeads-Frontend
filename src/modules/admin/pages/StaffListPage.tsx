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
  getRoles, // റോൾ ഫെച്ച് ചെയ്യാൻ ഇതും കൂടി ഇമ്പോർട്ട് ചെയ്തു
  Staff, 
  CreateStaffPayload 
} from "../services/staff.service";
import styles from "../components/StaffComponents.module.css";

export default function StaffListPage() {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [deptCount, setDeptCount] = useState<number>(0); // ഡിപ്പാർട്ട്മെന്റ് കൗണ്ട് സ്റ്റേറ്റ്
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  
  const [selectedStaffForView, setSelectedStaffForView] = useState<Staff | null>(null);
  const [selectedStaffForEdit, setSelectedStaffForEdit] = useState<Staff | null>(null);

  // റോളുകളും സ്റ്റാഫ് വിവരങ്ങളും ഒരുമിച്ച് ലോഡ് ചെയ്യുന്നു
  const loadPageData = () => {
    getStaffs()
      .then((data) => setStaffs(data))
      .catch((err) => console.error("Error loading staff:", err));

    getRoles()
      .then((data) => setDeptCount(data.length)) // റോൾ എപിഐ റെസ്പോൺസിന്റെ നീളം കണക്കാക്കുന്നു
      .catch((err) => console.error("Error loading roles:", err));
  };

  useEffect(() => {
    loadPageData();
  }, []);

  const handleSaveStaff = (payload: CreateStaffPayload) => {
    createStaff(payload)
      .then(() => {
        setIsFormOpen(false);
        loadPageData();
      })
      .catch((err) => console.error("Error creating staff:", err));
  };

  const handleUpdateStaff = (id: number, payload: Partial<CreateStaffPayload>, updatedStatus?: boolean) => {
    updateStaff(id, payload)
      .then(() => {
        if (updatedStatus !== undefined) {
          return updateStaffStatus(id, updatedStatus);
        }
      })
      .then(() => {
        setIsFormOpen(false);
        setSelectedStaffForEdit(null);
        loadPageData(); 
      })
      .catch((err) => console.error("Error updating staff & status:", err));
  };

  const handleDeleteStaff = (id: number) => {
    if (confirm("Are you sure you want to delete this staff?")) {
      deleteStaff(id)
        .then(() => loadPageData())
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
      .then(() => loadPageData())
      .catch((err) => console.error("Error patching staff status:", err));
  };

  const filteredStaffs = staffs.filter((s) =>
    s.staff_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // റിയൽ-ടൈം ആക്റ്റീവ്/ഇൻആക്റ്റീവ് കണക്കുകൂട്ടലുകൾ
  const activeCount = staffs.filter((s) => s.account_status === true).length;
  const inactiveCount = staffs.filter((s) => s.account_status === false).length;

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

      {/* ഡൈനാമിക് ആയി കണക്കാക്കിയ കൗണ്ടുകൾ പ്രോപ്സ് വഴി പാസ്സ് ചെയ്തു നൽകുന്നു */}
      <StaffKPIs 
        totalStaff={staffs.length} 
        activeCount={activeCount}
        inactiveCount={inactiveCount}
        deptCount={deptCount}
      />

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