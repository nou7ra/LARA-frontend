"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  AdminNavbar,
  UserFilters,
  UserTable,
  Pagination,
} from "@/components/admin-dashboard";
import api from "@/services/api";

interface AdminUser {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: string;
  status?: string;
}

const USERS_PER_PAGE = 7;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [studentsRes, instructorsRes] = await Promise.all([
          api.get("/admin/students"),
          api.get("/admin/instructors"),
        ]);
        const students = (studentsRes.data || []).map((u: any) => ({ ...u, role: "student", status: "Active" }));
        const instructors = (instructorsRes.data || []).map((u: any) => ({ ...u, role: "instructor", status: "Active" }));
        setUsers([...students, ...instructors]);
      } catch (err) {
        console.error("Users error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch =
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || user.status?.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [users, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(start, start + USERS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const user = users.find(u => u._id === id);
      if (user?.role === "student") await api.delete(`/admin/student/${id}`);
      else await api.delete(`/admin/instructor/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleSelectUser = (id: string) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    const ids = paginatedUsers.map(u => u._id);
    setSelectedUsers(prev => prev.length === ids.length ? [] : ids);
  };

  const handleReset = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
    setSelectedUsers([]);
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(to bottom, #FFD4A8, #FFECD9)" }}>
      <AdminNavbar activeTab="user-management" />
      <main className="px-4 md:px-8 py-6 max-w-6xl mx-auto">
        <UserFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onReset={handleReset}
        />

        {loading && <div className="text-center py-16 text-gray-500">Loading users...</div>}

        {!loading && (
          <UserTable
            users={paginatedUsers.map(u => ({ ...u, id: u._id }))}
            selectedUsers={selectedUsers}
            onSelectUser={(id: any) => handleSelectUser(id)}
            onSelectAll={handleSelectAll}
            onDelete={(id: any) => handleDelete(id)}
          />
        )}

        {totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        )}
      </main>
    </div>
  );
}