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
  getRoles, 
  Staff, 
  Role,
  CreateStaffPayload 
} from "../services/staff.service";
import styles from "../components/StaffComponents.module.css";

export default function StaffListPage() {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [roles, setRoles] = useState<Role[]>([]); // റോളുകളുടെ ലിസ്റ്റ്
  const [deptCount, setDeptCount] = useState<number>(0); 
  const [searchQuery, setSearchQuery] = useState("");
  
  // പുതിയ ഫിൽട്ടർ സ്റ്റേറ്റുകൾ
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  
  const [selectedStaffForView, setSelectedStaffForView] = useState<Staff | null>(null);
  const [selectedStaffForEdit, setSelectedStaffForEdit] = useState<Staff | null>(null);

  const loadPageData = () => {
    getStaffs()
      .then((data) => setStaffs(data || []))
      .catch((err) => console.error("Error loading staff:", err));

    getRoles()
      .then((data) => {
        setRoles(data || []);
        setDeptCount(data.length);
      })
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
      .catch((err) => console.error("Error updating staff:", err));
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
      .catch((err) => console.error("Error fetching staff:", err));
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

  // മൾട്ടി-ലെവൽ ഫിൽട്ടറിംഗ് ലോജിക്
  const filteredStaffs = staffs.filter((s) => {
    // 1. സെർച്ച് ഫിൽട്ടർ
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const matchesQuery = s.staff_name.toLowerCase().includes(query) || s.email.toLowerCase().includes(query);
      if (!matchesQuery) return false;
    }

    // 2. ഡ്രോപ്പ്ഡൗൺ സ്റ്റാഫ് ഫിൽട്ടർ
    if (selectedStaff && s.id !== selectedStaff.id) {
      return false;
    }

    // 3. റോൾ ഫിൽട്ടർ
    if (selectedRole !== "" && s.role_name.toLowerCase() !== selectedRole.toLowerCase()) {
      return false;
    }

    // 4. സ്റ്റാറ്റസ് ഫിൽട്ടർ (Active/Inactive)
    if (selectedStatus !== "") {
      const isActiveFilter = selectedStatus === "active";
      if (s.account_status !== isActiveFilter) {
        return false;
      }
    }

    return true;
  });

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
          className="cursor-pointer"
        >
          <Plus size={16} /> Add New Staff
        </Button>
      </div>

      <StaffKPIs 
        totalStaff={staffs.length} 
        activeCount={activeCount}
        inactiveCount={inactiveCount}
        deptCount={deptCount}
      />

      <StaffFilters 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        staffs={staffs}
        roles={roles}
        selectedStaff={selectedStaff}
        setSelectedStaff={setSelectedStaff}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
      />

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