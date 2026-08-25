"use client";
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/hooks/use-auth-store';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import Image from 'next/image';

export default function SellerDashboard() {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'jobs' | 'products' | 'portfolio' | 'availability' | 'ledger'>('jobs');
  
  const [assignments, setAssignments] = useState<any[]>([]);
  const [myServices, setMyServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Service Form State
  const [isAddingService, setIsAddingService] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [newService, setNewService] = useState({
    name: '', slug: '', description: '', basePrice: 0, category: 'Photography',
    extraHourPrice: 0, flexiblePrice: 0, coverImage: '', tags: '', locations: '', occasions: '', deliveryMethod: 'ON_SPOT'
  });
  const [uploading, setUploading] = useState(false);

  // Extract previous uploaded images
  const galleryImages = Array.from(new Set(
    myServices.flatMap(s => {
      const imgs = [];
      if (s.coverImage) imgs.push(s.coverImage);
      if (s.images && Array.isArray(s.images)) imgs.push(...s.images);
      return imgs;
    }).filter(Boolean)
  ));

  const loadData = async () => {
    setLoading(true);
    try {
      const [jobsRes, servicesRes] = await Promise.all([
        fetchApi('/bookings/my-assignments', { headers: { Authorization: `Bearer ${token}` } }),
        fetchApi('/services/my-services', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setAssignments(jobsRes.data || jobsRes || []);
      setMyServices(servicesRes.data || servicesRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || user?.role !== 'SELLER') {
      router.push('/seller/login');
      return;
    }
    loadData();
    // eslint-disable-next-line
  }, [token, user, router]);
  const updateJobStatus = async (jobId: string, status: string) => {
    try {
      await fetchApi(`/bookings/${jobId}/seller-status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      loadData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const updateJobDeliveryLink = async (jobId: string, link: string) => {
    try {
      await fetchApi(`/bookings/${jobId}/delivery-link`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ deliveryLink: link })
      });
      alert('Delivery link saved successfully!');
      loadData();
    } catch (err) {
      alert('Failed to save delivery link');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/v1/uploads', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setNewService({ ...newService, coverImage: data.url });
      }
    } catch (err) {
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: newService.name,
        slug: newService.slug,
        description: newService.description,
        basePrice: newService.basePrice,
        category: newService.category,
        extraHourPrice: newService.extraHourPrice || undefined,
        flexiblePrice: newService.flexiblePrice || undefined,
        coverImage: newService.coverImage || undefined,
        tags: newService.tags ? newService.tags.split(',').map(t => t.trim()) : [],
        locations: newService.deliveryMethod === 'REMOTE' ? ['Remote'] : (newService.locations ? newService.locations.split(',').map(l => l.trim()) : []),
        occasions: newService.deliveryMethod === 'REMOTE' ? [] : (newService.occasions ? newService.occasions.split(',').map(o => o.trim()) : []),
        deliveryMethod: newService.deliveryMethod,
      };
      await fetchApi('/services', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      alert('✅ Product submitted! It will go live after admin approval.');
      setIsAddingService(false);
      setNewService({ name: '', slug: '', description: '', basePrice: 0, category: 'Photography', extraHourPrice: 0, flexiblePrice: 0, coverImage: '', tags: '', locations: '', occasions: '', deliveryMethod: 'ON_SPOT' });
      loadData();
    } catch (err) {
      alert('Failed to create service');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await fetchApi(`/services/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      loadData();
    } catch (err) {
      alert('Failed to delete service');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your portal...</div>;

  const totalEarnings = assignments.filter(j => j.payoutStatus === 'PAID').reduce((sum, j) => sum + (j.pricing?.sellerPayout || 0), 0);
  const pendingEarnings = assignments.filter(j => j.payoutStatus !== 'PAID').reduce((sum, j) => sum + (j.pricing?.sellerPayout || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Seller Hub</h1>
        <div className="mt-4 md:mt-0 flex space-x-2 bg-gray-100 p-1 rounded-lg overflow-x-auto">
          <button onClick={() => setActiveTab('jobs')} className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${activeTab === 'jobs' ? 'bg-white shadow text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}>My Jobs</button>
          <button onClick={() => setActiveTab('products')} className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${activeTab === 'products' ? 'bg-white shadow text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}>My Products</button>
          <button onClick={() => setActiveTab('portfolio')} className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${activeTab === 'portfolio' ? 'bg-white shadow text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}>Portfolio</button>
          <button onClick={() => setActiveTab('availability')} className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${activeTab === 'availability' ? 'bg-white shadow text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}>Calendar</button>
          <button onClick={() => setActiveTab('ledger')} className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${activeTab === 'ledger' ? 'bg-white shadow text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}>Ledger</button>
        </div>
      </div>
      
      {activeTab === 'jobs' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Your Job Assignments</h2>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-sm text-amber-800">
            <strong>How it works:</strong> When a customer books a service, the Admin reviews the booking first. Once approved, the Admin assigns it to you and it will appear here.
          </div>
          {assignments.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center border border-gray-100">
              <h3 className="text-lg font-medium text-gray-900">No jobs assigned yet</h3>
              <p className="mt-1 text-gray-500">When admin assigns a booking to you, it will appear here.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {assignments.map(job => (
                <div key={job._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {job.status}
                      </span>
                      <span className="text-sm text-gray-500">{new Date(job.scheduledDate).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{job.serviceId?.name || 'Photography Service'}</h3>
                    <div className="text-sm text-gray-600 mb-4">
                      <div><strong>Customer:</strong> {job.customerId?.name}</div>
                      <div><strong>Location:</strong> {job.location?.address}, {job.location?.city}</div>
                      <div><strong>Time:</strong> {job.startTime} - {job.endTime}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded text-sm mb-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-500">Your Payout (90%):</span>
                        <span className="font-bold text-green-700">₹{job.pricing?.sellerPayout || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Payout Status:</span>
                        <span className={job.payoutStatus === 'PAID' ? 'text-green-600 font-medium' : 'text-orange-600'}>
                          {job.payoutStatus || 'PENDING'}
                        </span>
                      </div>
                    </div>
                    
                    {job.status !== 'COMPLETED' && (
                      <div className="mt-4 border-t pt-4">
                        <p className="text-xs text-gray-500 mb-2">Update Job Status:</p>
                        <select 
                          value={job.status}
                          onChange={(e) => updateJobStatus(job._id, e.target.value)}
                          className="w-full border-gray-300 rounded-md shadow-sm text-sm p-2"
                        >
                          <option value="ASSIGNED">Assigned (Not Started)</option>
                          <option value="IN_PROGRESS">In Progress / Shooting</option>
                          <option value="EDITING">Editing phase</option>
                          <option value="COMPLETED">Mark as Completed</option>
                          <option value="DELIVERED">Delivered</option>
                        </select>
                      </div>
                    )}
                    
                    <div className="mt-4 border-t pt-4">
                      <p className="text-xs text-gray-500 mb-2">High-Res Delivery Link (Drive/Dropbox):</p>
                      <div className="flex space-x-2">
                        <input 
                          type="url" 
                          placeholder="https://drive.google.com/..." 
                          defaultValue={job.deliveryLink || ''}
                          onBlur={(e) => {
                            if (e.target.value !== (job.deliveryLink || '')) {
                              updateJobDeliveryLink(job._id, e.target.value);
                            }
                          }}
                          className="flex-1 border-gray-300 rounded-md shadow-sm text-sm p-2 border"
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Click outside to save. Customers will see this link to download full resolution images.</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'products' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">My Products</h2>
            <button onClick={() => setIsAddingService(!isAddingService)} className="bg-indigo-600 text-white px-4 py-2 rounded shadow text-sm">
              {isAddingService ? 'Cancel' : '+ Add Product'}
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800">
            <strong>Note:</strong> All products you submit will be reviewed by the admin before going live. Your personal details (name, phone, photo) will NOT be shown to customers — products appear as platform offerings. Platform commission is 10%.
          </div>

          {isAddingService && (
            <form onSubmit={handleCreateService} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8 space-y-5">
              <h3 className="font-bold text-lg mb-2">Create New Product</h3>
              
              {/* Cover Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {newService.coverImage && (
                    <div className="w-20 h-20 relative flex-shrink-0">
                      <Image src={newService.coverImage.startsWith('/') ? `https://api.instaimage.in${newService.coverImage}` : newService.coverImage} alt="Cover" fill sizes="80px" className="object-cover rounded border" />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded text-sm font-medium text-gray-700 border border-gray-300">
                      {uploading ? 'Uploading...' : 'Upload New'}
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                    {galleryImages.length > 0 && (
                      <button type="button" onClick={() => setIsGalleryOpen(true)} className="bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded text-sm font-medium text-indigo-700 border border-indigo-200 transition-colors">
                        Choose from Gallery
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2 border-b pb-4 mb-2">
                  <label className="block text-sm font-bold text-gray-900 mb-2">Service Type *</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="deliveryMethod" value="ON_SPOT" checked={newService.deliveryMethod !== 'REMOTE'} onChange={() => setNewService({...newService, deliveryMethod: 'ON_SPOT', locations: ''})} className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
                      <span className="text-sm font-medium text-gray-700">On-Site (Shoot / Physical)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="deliveryMethod" value="REMOTE" checked={newService.deliveryMethod === 'REMOTE'} onChange={() => setNewService({...newService, deliveryMethod: 'REMOTE', locations: 'Remote', flexiblePrice: 0, extraHourPrice: 0})} className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
                      <span className="text-sm font-medium text-gray-700">Remote (Post-Production / Editing)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Product Name *</label>
                  <input required type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500" placeholder="e.g. Wedding Photography" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category *</label>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500" value={newService.category} onChange={e => setNewService({...newService, category: e.target.value})}>
                    <option>Photography</option>
                    <option>Videography</option>
                    <option>Photo + Video</option>
                    <option>Editing & Post-Production</option>
                    <option>Drone</option>
                    <option>Album Design</option>
                  </select>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Description *</label>
                  <textarea required rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500" placeholder="Describe your service in detail — what's included, deliverables, timeline, etc." value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Base Price (₹) *</label>
                  <input required type="number" min="0" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500" value={newService.basePrice} onChange={e => setNewService({...newService, basePrice: Number(e.target.value)})} />
                </div>
                
                {newService.deliveryMethod !== 'REMOTE' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Extra Hour Price (₹)</label>
                      <input type="number" min="0" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500" placeholder="Optional" value={newService.extraHourPrice || ''} onChange={e => setNewService({...newService, extraHourPrice: Number(e.target.value)})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Flexible Price (₹)</label>
                      <input type="number" min="0" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500" placeholder="Optional per-hour rate" value={newService.flexiblePrice || ''} onChange={e => setNewService({...newService, flexiblePrice: Number(e.target.value)})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Locations (Cities)</label>
                      <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500" placeholder="Kolkata, Delhi (comma separated)" value={newService.locations} onChange={e => setNewService({...newService, locations: e.target.value})} />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Tags</label>
                  <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500" placeholder="wedding, outdoor, editing (comma separated)" value={newService.tags} onChange={e => setNewService({...newService, tags: e.target.value})} />
                </div>
                
                {newService.deliveryMethod !== 'REMOTE' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Occasions</label>
                    <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500" placeholder="Wedding, Birthday (comma separated)" value={newService.occasions} onChange={e => setNewService({...newService, occasions: e.target.value})} />
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-md font-medium shadow">Submit for Admin Approval</button>
                <button type="button" onClick={() => setIsAddingService(false)} className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-md font-medium">Cancel</button>
              </div>
            </form>
          )}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {myServices.map(s => (
                  <tr key={s._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {s.coverImage && <div className="w-10 h-10 relative flex-shrink-0"><Image src={s.coverImage} alt="" fill sizes="40px" className="rounded object-cover" /></div>}
                        <span className="font-medium text-gray-900">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{s.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">₹{s.basePrice?.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        s.isApproved ? 'bg-green-100 text-green-800' : 
                        s.isActive === false ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {s.isApproved ? '✅ Live' : s.isActive === false ? '❌ Rejected' : '⏳ Pending Approval'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {!s.isApproved && (
                        <button onClick={() => handleDeleteService(s._id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
                {myServices.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">You haven&apos;t listed any products yet. Click &quot;+ Add Product&quot; to get started.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'portfolio' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">My Portfolio & Gallery</h2>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded shadow text-sm">
              + Upload Photos
            </button>
          </div>
          <div className="bg-white rounded-lg shadow p-12 text-center border border-gray-200 mb-8">
            <h3 className="font-bold text-gray-900 mb-2">Build your showcase</h3>
            <p className="text-gray-500 text-sm mb-4">Upload your best work to attract more bookings. Support for video links and image galleries is coming soon.</p>
          </div>
        </div>
      )}

      {activeTab === 'availability' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">My Availability & Calendar</h2>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded shadow text-sm">
              + Block Dates
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8 space-y-4">
            <h3 className="font-bold mb-4">Standard Working Hours</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                <div key={day} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                  <span className="font-medium w-24">{day}</span>
                  <div className="flex items-center gap-2">
                    <input type="time" defaultValue="09:00" className="border rounded px-2 py-1 text-sm" />
                    <span>to</span>
                    <input type="time" defaultValue="18:00" className="border rounded px-2 py-1 text-sm" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button className="bg-indigo-600 text-white px-4 py-2 rounded shadow text-sm">Save Hours</button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden p-6 border border-gray-200">
            <h3 className="font-bold mb-4">Blocked Dates & Time Off</h3>
            <p className="text-gray-500 text-sm mb-4">You have not blocked any upcoming dates. Customers can book you during your standard working hours.</p>
          </div>
        </div>
      )}

      {activeTab === 'ledger' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Financial Ledger</h2>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-green-800 text-sm font-bold uppercase tracking-wider mb-1">Total Paid Out</h3>
              <p className="text-3xl font-extrabold text-green-600">₹{totalEarnings.toLocaleString()}</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h3 className="text-orange-800 text-sm font-bold uppercase tracking-wider mb-1">Pending Clearance</h3>
              <p className="text-3xl font-extrabold text-orange-600">₹{pendingEarnings.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Your Share (90%)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payout Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignments.map(a => (
                  <tr key={a._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{a.bookingId || a._id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(a.scheduledDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">₹{a.pricing?.sellerPayout || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${a.payoutStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                        {a.payoutStatus || 'PENDING'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Choose from Media Gallery</h3>
              <button onClick={() => setIsGalleryOpen(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1">
              {galleryImages.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No previous images found.</div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {galleryImages.map((img, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => {
                        setNewService({ ...newService, coverImage: img });
                        setIsGalleryOpen(false);
                      }}
                      className="aspect-square relative rounded-lg overflow-hidden border-2 border-transparent hover:border-indigo-500 cursor-pointer shadow-sm group"
                    >
                      <Image 
                        src={img.startsWith('/') ? `https://api.instaimage.in${img}` : img} 
                        alt={`Gallery image ${idx}`} 
                        fill 
                        sizes="150px" 
                        className="object-cover group-hover:scale-105 transition-transform" 
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button onClick={() => setIsGalleryOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
