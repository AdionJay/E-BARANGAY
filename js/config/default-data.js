/**
 * Factory-default dataset used on first run / reset.
 * Defines: defaultData
 */
const defaultData = {
  residents: [],
  documents: [],
  payments: [],
  services: [],
  notifications: [],
  pendingRegistrations: [],
  docTypes: JSON.parse(JSON.stringify(DEFAULT_DOC_TYPES)),
  profiling: {
    name: 'Barangay Dumanguena',
    city: 'Narra',
    Municipality: 'Narra',
    province: 'Palawan',
    population: 0,
    households: 0,
    puroks: 8,
    captain: 'Hon. Amy A. Diwara',
    contact: '0985-180-2847',
    email: 'barangay.dumanguena@email.com',
    address: 'Barangay Hall, Dumanguena, Narra, Palawan',
    landArea: '2.5 sq. km',
    established: '1975'
  },
  users: [
    { username: 'admin', password: 'admin123', role: 'Admin', name: 'Hon. Amy A. Diwara' },
    { username: 'captain', password: 'cap123', role: 'Admin', name: 'Hon. Amy A. Diwara' },
    { username: 'secretary', password: 'sec123', role: 'Secretary', name: 'Barangay Secretary' },
    { username: 'treasurer', password: 'treas123', role: 'Treasurer', name: 'Barangay Treasurer' }
  ],
  currentUser: null,
  gcashAccount: { number: '0985-180-2847', name: 'Barangay Dumanguena — Treasurer' },
  captainSignature: null
};
