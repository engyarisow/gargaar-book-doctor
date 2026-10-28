import React, { useContext, useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Doctors = () => {
  const { speciality } = useParams();
  const navigate = useNavigate();
  const { doctors } = useContext(AppContext);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [page, setPage] = useState(1);

  const ITEMS_PER_PAGE = 6;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const decodedSpeciality = speciality ? decodeURIComponent(speciality) : null;

  const specialities = [
    'General physician',
    'Gynecologist',
    'Dermatologist',
    'Pediatrician',
    'Neurologist',
    'Gastroenterologist'
  ];

  const filteredDoctors = useMemo(() => {
    // 1. Keliya soo reeb kuwa la Approve gareeyay oo aan Block saarneyn
    let validDoctors = doctors.filter(
      (doc) => doc.status === 'Approved' && doc.blocked !== true
    );

    // 2. Filter garee Speciality-ga haddii la doortay
    let result = decodedSpeciality
      ? validDoctors.filter(doc => doc.speciality === decodedSpeciality)
      : validDoctors;

    // 3. Raadiyaha (Search-ga)
    result = result.filter(doc =>
      doc.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    // 4. Kala hor-marinta (Sorting-ka)
    if (sortBy === 'fee-low') {
      result = [...result].sort((a, b) => a.fees - b.fees);
    } else if (sortBy === 'fee-high') {
      result = [...result].sort((a, b) => b.fees - a.fees);
    } else if (sortBy === 'exp-high') {
      result = [...result].sort((a, b) => parseInt(b.experience) - parseInt(a.experience));
    }

    return result;
  }, [doctors, decodedSpeciality, debouncedSearch, sortBy]);

  // Pagination logic
  const totalPages = Math.ceil(filteredDoctors.length / ITEMS_PER_PAGE);
  const paginatedDoctors = filteredDoctors.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="px-6 py-10 max-w-7xl mx-auto">

      {/* Breadcrumb */}
      <div className="flex gap-2 text-sm text-slate-400 mb-6">
        <span className="cursor-pointer" onClick={() => navigate('/')}>Home</span>
        <span>›</span>
        <span className="text-slate-900 font-semibold">Specialists</span>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search doctors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-xl w-full md:w-1/3"
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border rounded-xl w-full md:w-1/4"
        >
          <option value="">Sort By</option>
          <option value="fee-low">Fee: Low to High</option>
          <option value="fee-high">Fee: High to Low</option>
          <option value="exp-high">Experience: High to Low</option>
        </select>

        <button
          onClick={() => setShowSidebar(true)}
          className="md:hidden px-4 py-2 border rounded-xl"
        >
          Filters
        </button>
      </div>

      <div className="flex gap-10">

        {/* Sidebar */}
        <div className="hidden md:block min-w-[220px]">
          {specialities.map((spec, i) => {
            const isActive = decodedSpeciality === spec;
            return (
              <div
                key={i}
                onClick={() => {
                  setPage(1);
                  isActive
                    ? navigate('/doctors')
                    : navigate(`/doctors/${encodeURIComponent(spec)}`);
                }}
                className={`px-5 py-3 rounded-full mb-3 cursor-pointer font-semibold border
                  ${isActive
                    ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
              >
                {spec}
              </div>
            );
          })}
        </div>

        {/* Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedDoctors.length === 0 ? (
              <p className="text-slate-500">No doctors found.</p>
            ) : (
              paginatedDoctors.map((item) => (
                <div
                  key={item._id}
                  onClick={() => navigate(`/appointments/${item._id}`)}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                >
                  <div className="h-64 bg-slate-100 relative overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    
                    {/* AVAILABLE / NOT AVAILABLE LOGIC */}
                    <div className={`absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 ${item.available ? 'text-green-600' : 'text-red-500'}`}>
                      <span className={`w-2 h-2 rounded-full ${item.available ? 'bg-green-600' : 'bg-red-500'}`}></span>
                      {item.available ? 'Available' : 'Not Available'}
                    </div>

                  </div>

                  <div className="p-6">
                    <p className="text-lg font-bold text-slate-900">{item.name}</p>
                    <p className="text-xs text-indigo-500 uppercase mb-3">
                      {item.speciality}
                    </p>

                    <div className="flex justify-between text-sm border-t pt-3 text-slate-500">
                      <div>
                        Experience <br />
                        <span className="text-slate-900 font-semibold">{item.experience}</span>
                      </div>

                      <div>
                        Fee <br />
                        <span className="text-slate-900 font-semibold">${item.fees}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-4 py-2 rounded-lg border ${
                    page === i + 1
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white text-slate-600'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Doctors;