import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/Admin/AdminSidebar';
import DashboardOverview from '../components/Admin/DashboardOverview';
import OutletManager from '../components/Admin/OutletManager';
import BookingManager from '../components/Admin/BookingManager';
import ManualBookingModal from '../components/Admin/ManualBookingModal';
import ServiceManager from '../components/Admin/ServiceManager';
import StaffManager from '../components/Admin/StaffManager';
import PaymentManager from '../components/Admin/PaymentManager';
import PaymentConfig from '../components/Admin/PaymentConfig';
import UserManager from '../components/Admin/UserManager';
import { useAuth } from '../context/AuthContext';
import { getAllBookings, refreshBookings, getServices, getOutlets } from '../services/api';

export default function AdminDashboardPage({ onGoHome }) {
  const { admin } = useAuth();
  const isSuperAdmin = admin?.role === 'admin';
  const branchOutletId = admin?.role !== 'admin' && admin?.outlet_id ? String(admin.outlet_id) : '';

  const [activeTab, setActiveTab] = useState('overview');
  
  // Data states
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  const [outlets, setOutlets] = useState([]);
  const [outletFilter, setOutletFilter] = useState(branchOutletId);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  // Manual booking modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Sync outlet filter if logged in as branch admin
  useEffect(() => {
    if (!isSuperAdmin && branchOutletId) {
      setOutletFilter(branchOutletId);
    }
  }, [isSuperAdmin, branchOutletId]);

  // Protect tabs if not super admin
  useEffect(() => {
    if (!isSuperAdmin && (activeTab === 'outlets' || activeTab === 'users' || activeTab === 'payment')) {
      setActiveTab('overview');
    }
  }, [activeTab, isSuperAdmin]);

  useEffect(() => {
    const effectiveOutlet = (!isSuperAdmin && branchOutletId) ? branchOutletId : outletFilter;
    fetchBookingsData(effectiveOutlet);
    fetchServicesData(effectiveOutlet);
    fetchOutletsData();
  }, [statusFilter, dateFilter, outletFilter, isSuperAdmin, branchOutletId]);

  const fetchBookingsData = async (effectiveOutlet = outletFilter) => {
    try {
      setLoadingBookings(true);
      const res = await getAllBookings(statusFilter, dateFilter, effectiveOutlet);
      if (res.success) {
        setBookings(res.bookings);
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Error loading bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchServicesData = async (effectiveOutlet = outletFilter) => {
    try {
      setLoadingServices(true);
      const res = await getServices(effectiveOutlet);
      if (res.success) {
        setServices(res.services);
      }
    } catch (err) {
      console.error('Error loading services:', err);
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchOutletsData = async () => {
    try {
      const res = await getOutlets(false);
      if (res.success) {
        setOutlets(res.outlets);
      }
    } catch (err) {
      console.error('Error loading outlets:', err);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoadingBookings(true);
      const effectiveOutlet = (!isSuperAdmin && branchOutletId) ? branchOutletId : outletFilter;
      const res = await refreshBookings(statusFilter, dateFilter, effectiveOutlet);
      if (res.success) {
        setBookings(res.bookings);
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Error refreshing bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-sand/30 font-sans">
      
      {/* Sidebar Navigation */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onGoHome={onGoHome}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {activeTab === 'overview' && (
          <DashboardOverview
            stats={stats}
            bookings={bookings}
            onOpenManualModal={() => setIsManualModalOpen(true)}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'outlets' && isSuperAdmin && (
          <OutletManager />
        )}

        {activeTab === 'users' && isSuperAdmin && (
          <UserManager outlets={outlets} />
        )}

        {activeTab === 'bookings' && (
          <BookingManager
            bookings={bookings}
            loading={loadingBookings}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            outletFilter={outletFilter}
            setOutletFilter={setOutletFilter}
            outlets={outlets}
            onRefresh={handleRefresh}
            onOpenManualModal={() => setIsManualModalOpen(true)}
            services={services}
            userRole={admin?.role}
            userOutletId={admin?.outlet_id}
            userOutletName={admin?.outlet_name}
          />
        )}

        {activeTab === 'services' && (
          <ServiceManager
            services={services}
            loading={loadingServices}
            onRefresh={() => fetchServicesData((!isSuperAdmin && branchOutletId) ? branchOutletId : outletFilter)}
            outlets={outlets}
            userRole={admin?.role}
            userOutletId={admin?.outlet_id}
            userOutletName={admin?.outlet_name}
          />
        )}

        {activeTab === 'staff' && (
          <StaffManager 
            services={services} 
            outlets={outlets} 
            userRole={admin?.role}
            userOutletId={admin?.outlet_id}
          />
        )}

        {activeTab === 'payments_module' && (
          <PaymentManager
            bookings={bookings}
            loading={loadingBookings}
            onRefresh={handleRefresh}
            outlets={outlets}
            outletFilter={outletFilter}
            setOutletFilter={setOutletFilter}
            userRole={admin?.role}
            userOutletId={admin?.outlet_id}
            userOutletName={admin?.outlet_name}
          />
        )}

        {activeTab === 'payment' && isSuperAdmin && (
          <PaymentConfig />
        )}
      </main>

      {/* Manual Booking Modal */}
      <ManualBookingModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        services={services}
        outlets={outlets}
        userOutletId={admin?.outlet_id}
        onSaved={() => fetchBookingsData((!isSuperAdmin && branchOutletId) ? branchOutletId : outletFilter)}
      />

    </div>
  );
}
