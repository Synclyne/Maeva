import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { counties, kenyanLocations, propertyTypes, amenitiesList } from '../data/locations';
import { useToast } from '../context/ToastContext';
import api from '../lib/api';

const BLANK = {
  title:'', description:'', type:'House', transaction:'sale', price:'', price_period:'monthly',
  county:'Nairobi', area:'', address:'', lat:'', lng:'', bedrooms:'', bathrooms:'', size:'', size_unit:'sqft',
  amenities:[], imageUrls:[''], accept_enquiries: true, title_deed_number:'',
};

export default function PostListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const toast  = useToast();
  const [form, setForm] = useState(BLANK);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [floorPlanFiles, setFloorPlanFiles] = useState([]);
  const [floorPlanPreviews, setFloorPlanPreviews] = useState([]);
  const [existingFloorPlans, setExistingFloorPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');
  const fileRef = useRef();
  const floorPlanRef = useRef();

  const areas = kenyanLocations[form.county] || [];
  const isLand = form.type === 'Land';
  const isRent = form.transaction === 'rent';

  useEffect(() => {
    if (!isEdit) return;
    setFetching(true);
    api.get(`/listings/${id}`).then(({ data }) => {
      setForm({
        title: data.title || '',
        description: data.description || '',
        type: data.type || 'House',
        transaction: data.transaction || 'sale',
        price: data.price || '',
        price_period: data.price_period || 'monthly',
        county: data.county || 'Nairobi',
        area: data.area || '',
        address: data.address || '',
        bedrooms: data.bedrooms ?? '',
        bathrooms: data.bathrooms ?? '',
        lat: data.lat ?? '',
        lng: data.lng ?? '',
        accept_enquiries: data.accept_enquiries !== 0,
        size: data.size ?? '',
        size_unit: data.size_unit || 'sqft',
        amenities: data.amenities || [],
        imageUrls: [''],
        title_deed_number: data.title_deed_number || '',
      });
      setExistingImages(data.images || []);
      setExistingFloorPlans(data.floor_plans || []);
    }).catch(() => navigate('/dashboard')).finally(() => setFetching(false));
  }, [id, isEdit, navigate]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const toggleAmenity = (a) => {
    setForm(p => ({
      ...p,
      amenities: p.amenities.includes(a) ? p.amenities.filter(x => x !== a) : [...p.amenities, a],
    }));
  };

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selected]);
    selected.forEach(f => {
      const reader = new FileReader();
      reader.onload = ev => setPreviews(prev => [...prev, ev.target.result]);
      reader.readAsDataURL(f);
    });
  };

  const removeFile = (i) => {
    setFiles(p => p.filter((_, idx) => idx !== i));
    setPreviews(p => p.filter((_, idx) => idx !== i));
  };

  const removeExisting = (i) => setExistingImages(p => p.filter((_, idx) => idx !== i));

  const handleFloorPlanFiles = (e) => {
    const selected = Array.from(e.target.files);
    setFloorPlanFiles(prev => [...prev, ...selected]);
    selected.forEach(f => {
      const reader = new FileReader();
      reader.onload = ev => setFloorPlanPreviews(prev => [...prev, ev.target.result]);
      reader.readAsDataURL(f);
    });
  };

  const removeFloorPlan = (i) => {
    setFloorPlanFiles(p => p.filter((_, idx) => idx !== i));
    setFloorPlanPreviews(p => p.filter((_, idx) => idx !== i));
  };

  const removeExistingFloorPlan = (i) => setExistingFloorPlans(p => p.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const fd = new FormData();
      const fields = { ...form };
      delete fields.imageUrls;
      delete fields.amenities;
      // Convert boolean to 0/1 for FormData
      fields.accept_enquiries = form.accept_enquiries ? 1 : 0;

      Object.entries(fields).forEach(([k, v]) => { if (v !== '' && v !== null && v !== undefined) fd.append(k, v); });
      form.amenities.forEach(a => fd.append('amenities', a));
      form.imageUrls.filter(u => u.trim()).forEach(u => fd.append('imageUrls', u.trim()));
      if (isEdit) existingImages.forEach(img => fd.append('existingImages', img));
      if (isEdit) existingFloorPlans.forEach(fp => fd.append('existingFloorPlans', fp));
      files.forEach(f => fd.append('images', f));
      floorPlanFiles.forEach(f => fd.append('floor_plans', f));

      if (isEdit) {
        await api.put(`/listings/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Listing updated successfully!');
      } else {
        await api.post('/listings', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Listing posted successfully! It is now live on Maeva.');
      }
      navigate('/dashboard');
    } catch (err) {
      const msg = err.friendlyMessage || err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="pt-16 min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold text-gray-900">{isEdit ? 'Edit Listing' : 'Post a Listing'}</h1>
          <p className="text-gray-500 mt-1">{isEdit ? 'Update your property details' : 'Fill in the details below to list your property on Maeva'}</p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* BASIC INFO */}
          <Section title="Basic Information" icon="📋">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label">Listing Title *</label>
                <input className="input" placeholder="e.g. 3BR Modern House in Karen" value={form.title} onChange={e => set('title', e.target.value)} required />
              </div>

              <div>
                <label className="label">Property Type *</label>
                <select className="input" value={form.type} onChange={e => set('type', e.target.value)}>
                  {propertyTypes.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="label">Listing For *</label>
                <div className="grid grid-cols-2 gap-2">
                  {[['sale','For Sale'],['rent','For Rent']].map(([val, label]) => (
                    <button type="button" key={val} onClick={() => set('transaction', val)}
                      className={`py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${form.transaction===val ? 'border-primary bg-primary-pale text-primary' : 'border-gray-200 text-gray-600'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* LOCATION */}
          <Section title="Location" icon="📍">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">County *</label>
                <select className="input" value={form.county} onChange={e => { set('county', e.target.value); set('area', ''); }}>
                  {counties.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="label">Area / Town *</label>
                <select className="input" value={form.area} onChange={e => set('area', e.target.value)} required>
                  <option value="">Select area…</option>
                  {areas.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="label">Street Address (Optional)</label>
                <input className="input" placeholder="e.g. Karen Road, off Ngong Road" value={form.address} onChange={e => set('address', e.target.value)} />
              </div>

              <div>
                <label className="label">Latitude (Optional)</label>
                <input className="input" type="number" step="any" placeholder="-1.2921" value={form.lat} onChange={e => set('lat', e.target.value)} />
              </div>
              <div>
                <label className="label">Longitude (Optional)</label>
                <input className="input" type="number" step="any" placeholder="36.8219" value={form.lng} onChange={e => set('lng', e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-400">💡 Lat/Lng improves map pin accuracy. Find coordinates at <a href="https://www.latlong.net" target="_blank" rel="noreferrer" className="text-primary hover:underline">latlong.net</a></p>
              </div>
            </div>
          </Section>

          {/* PRICING */}
          <Section title="Price" icon="💰">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Price (KES) *</label>
                <input className="input" type="number" placeholder="e.g. 25000000" value={form.price} onChange={e => set('price', e.target.value)} required min="0" />
              </div>

              {isRent && (
                <div>
                  <label className="label">Rent Period</label>
                  <select className="input" value={form.price_period} onChange={e => set('price_period', e.target.value)}>
                    <option value="monthly">Per Month</option>
                    <option value="yearly">Per Year</option>
                  </select>
                </div>
              )}
            </div>
          </Section>

          {/* PROPERTY DETAILS */}
          <Section title="Property Details" icon="🏠">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {!isLand && (
                <>
                  <div>
                    <label className="label">Bedrooms</label>
                    <select className="input" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)}>
                      <option value="">—</option>
                      <option value="0">Studio</option>
                      {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Bathrooms</label>
                    <select className="input" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)}>
                      <option value="">—</option>
                      {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </>
              )}
              <div>
                <label className="label">Size</label>
                <input className="input" type="number" placeholder="e.g. 2500" value={form.size} onChange={e => set('size', e.target.value)} min="0" />
              </div>
              <div>
                <label className="label">Unit</label>
                <select className="input" value={form.size_unit} onChange={e => set('size_unit', e.target.value)}>
                  <option value="sqft">sq ft</option>
                  <option value="sqm">sq m</option>
                  <option value="acres">Acres</option>
                </select>
              </div>
            </div>
          </Section>

          {/* DESCRIPTION */}
          <Section title="Description" icon="📝">
            <textarea className="input min-h-[130px] resize-none" placeholder="Describe the property — neighbourhood, unique features, nearby amenities…"
              value={form.description} onChange={e => set('description', e.target.value)} />
          </Section>

          {/* AMENITIES */}
          <Section title="Amenities" icon="✨">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {amenitiesList.map(a => (
                <label key={a} className={`flex items-center gap-2.5 p-2.5 rounded-xl border-2 cursor-pointer transition-all ${form.amenities.includes(a) ? 'border-primary bg-primary-pale' : 'border-gray-100 hover:border-gray-200'}`}>
                  <input type="checkbox" className="sr-only" checked={form.amenities.includes(a)} onChange={() => toggleAmenity(a)} />
                  <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${form.amenities.includes(a) ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                    {form.amenities.includes(a) && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                  </span>
                  <span className="text-sm">{a}</span>
                </label>
              ))}
            </div>
          </Section>

          {/* IMAGES */}
          <Section title="Photos" icon="📸">
            {/* Existing images (edit mode) */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Current photos (click × to remove)</p>
                <div className="flex flex-wrap gap-2">
                  {existingImages.map((img, i) => (
                    <div key={i} className="relative w-20 h-16 rounded-lg overflow-hidden border border-gray-200 group">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeExisting(i)}
                        className="absolute inset-0 bg-red-500/70 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold transition-opacity">×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload */}
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileRef.current.click()}>
              <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFiles} />
              <div className="text-3xl mb-2">📷</div>
              <p className="text-sm font-medium text-gray-700">Click to upload photos</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 8MB each</p>
            </div>

            {/* File previews */}
            {previews.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative w-20 h-16 rounded-lg overflow-hidden border border-gray-200 group">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeFile(i)}
                      className="absolute inset-0 bg-red-500/70 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold transition-opacity">×</button>
                  </div>
                ))}
              </div>
            )}

            {/* Image URLs */}
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">Or add image URLs</p>
              {form.imageUrls.map((url, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input className="input text-sm" placeholder="https://..." value={url}
                    onChange={e => { const u = [...form.imageUrls]; u[i] = e.target.value; set('imageUrls', u); }} />
                  {form.imageUrls.length > 1 && (
                    <button type="button" onClick={() => set('imageUrls', form.imageUrls.filter((_, idx) => idx !== i))}
                      className="px-3 text-gray-400 hover:text-red-500">×</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => set('imageUrls', [...form.imageUrls, ''])}
                className="text-sm text-primary hover:underline">+ Add another URL</button>
            </div>
          </Section>

          {/* LEGAL */}
          <Section title="Legal Information" icon="📄">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Title Deed / LR Number</label>
                <input className="input" placeholder="e.g. LR/123/456 or IR/789" value={form.title_deed_number} onChange={e => set('title_deed_number', e.target.value)} />
                <p className="text-xs text-gray-400 mt-1">Land Registration number from the title deed document</p>
              </div>
            </div>
          </Section>

          {/* FLOOR PLANS */}
          <Section title="Floor Plans" icon="🗺️">
            {existingFloorPlans.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Current floor plans (click × to remove)</p>
                <div className="flex flex-wrap gap-2">
                  {existingFloorPlans.map((fp, i) => (
                    <div key={i} className="relative w-24 h-20 rounded-lg overflow-hidden border border-gray-200 group">
                      <img src={fp} alt={`Floor plan ${i+1}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeExistingFloorPlan(i)}
                        className="absolute inset-0 bg-red-500/70 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold transition-opacity">×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => floorPlanRef.current.click()}>
              <input ref={floorPlanRef} type="file" multiple accept="image/*,application/pdf" className="hidden" onChange={handleFloorPlanFiles} />
              <div className="text-3xl mb-2">🗺️</div>
              <p className="text-sm font-medium text-gray-700">Upload floor plan images</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG or PDF — up to 5 files</p>
            </div>
            {floorPlanPreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {floorPlanPreviews.map((src, i) => (
                  <div key={i} className="relative w-24 h-20 rounded-lg overflow-hidden border border-gray-200 group">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeFloorPlan(i)}
                      className="absolute inset-0 bg-red-500/70 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold transition-opacity">×</button>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* ENQUIRY SETTINGS */}
          <Section title="Enquiry Settings" icon="💬">
            <label className="flex items-center justify-between cursor-pointer gap-4 p-1">
              <div>
                <div className="font-medium text-gray-800 text-sm">Accept Enquiries</div>
                <div className="text-xs text-gray-400 mt-0.5">When off, the contact form is hidden and buyers see a "not accepting enquiries" notice</div>
              </div>
              <button
                type="button"
                onClick={() => set('accept_enquiries', !form.accept_enquiries)}
                className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${form.accept_enquiries ? 'bg-primary' : 'bg-gray-300'}`}
                aria-checked={form.accept_enquiries}
                role="switch"
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.accept_enquiries ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </label>
          </Section>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate('/dashboard')}
              className="flex-1 btn-outline py-3 rounded-xl font-semibold">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 btn-primary py-3 rounded-xl font-semibold disabled:opacity-60">
              {loading ? 'Saving…' : isEdit ? 'Update Listing' : 'Publish Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-5">
        <span>{icon}</span>{title}
      </h3>
      {children}
    </div>
  );
}
