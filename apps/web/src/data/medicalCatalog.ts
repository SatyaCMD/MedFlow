/* eslint-disable @typescript-eslint/no-explicit-any */
export interface DoctorProfile {
  id: string;
  name: string;
  qualification: string;
  specialty: string;
  subSpecialty: string;
  department: string;
  rating: number;
  reviews: number;
  experience: string;
  fee: string; // Formatted in ₹ (INR)
  nextSlot: string;
  availableSlots: string[]; // 5-7 slots per doctor
  hospitalUnit: string;
  avatar: string;
}

export interface DepartmentCategory {
  category: string;
  departments: Array<{
    name: string;
    specialties: string[];
  }>;
}

export const MEDICAL_DEPARTMENTS_CATALOG: DepartmentCategory[] = [
  {
    category: 'General & Primary Medicine',
    departments: [
      { name: 'General Medicine', specialties: ['General Physician (Internal Medicine)', 'Family Medicine'] },
      { name: 'Pediatrics', specialties: ['Pediatrician', 'Pediatric Surgeon', 'Pediatric Neurologist', 'Pediatric Cardiologist', 'Neonatologist'] },
      { name: 'Geriatrics', specialties: ['Geriatrician', 'Elderly Care Specialist'] },
      { name: 'Preventive Medicine', specialties: ['Preventive Medicine Specialist', 'Public Health Specialist'] },
    ],
  },
  {
    category: 'Cardiovascular & Pulmonary',
    departments: [
      { name: 'Cardiology', specialties: ['Cardiologist', 'Interventional Cardiologist', 'Electrophysiologist', 'Cardiac Surgeon'] },
      { name: 'Pulmonology', specialties: ['Pulmonologist', 'Critical Care Specialist', 'Sleep Medicine Specialist'] },
      { name: 'Cardiothoracic Surgery', specialties: ['Cardiothoracic Surgeon', 'Coronary Bypass Specialist'] },
      { name: 'Vascular Surgery', specialties: ['Vascular Surgeon', 'Endovascular Specialist'] },
    ],
  },
  {
    category: 'Neurology & Brain Sciences',
    departments: [
      { name: 'Neurology', specialties: ['Neurologist', 'Neurophysiologist', 'Stroke Specialist'] },
      { name: 'Neurosurgery', specialties: ['Neurosurgeon', 'Spine Neurosurgeon', 'Pediatric Neurosurgeon'] },
      { name: 'Psychiatry', specialties: ['Psychiatrist', 'Child Psychiatrist', 'Addiction Psychiatrist'] },
      { name: 'Psychology', specialties: ['Clinical Psychologist', 'Counseling Psychologist', 'Neuropsychologist'] },
    ],
  },
  {
    category: 'Musculoskeletal & Orthopedics',
    departments: [
      { name: 'Orthopedics', specialties: ['Orthopedic Surgeon', 'Joint Replacement Specialist', 'Spine Surgeon', 'Sports Medicine Specialist'] },
      { name: 'Rheumatology', specialties: ['Rheumatologist', 'Autoimmune Joint Specialist'] },
      { name: 'Physical Medicine & Rehabilitation', specialties: ['Physiatrist', 'Rehabilitation Specialist'] },
      { name: 'Physiotherapy', specialties: ['Physiotherapist', 'Sports Physiotherapist', 'Neuro Physiotherapist', 'Cardio Physiotherapist'] },
    ],
  },
  {
    category: 'Oncology & Hematology',
    departments: [
      { name: 'Oncology', specialties: ['Medical Oncologist', 'Surgical Oncologist', 'Radiation Oncologist', 'Hemato-Oncologist'] },
      { name: 'Hematology', specialties: ['Hematologist', 'Transfusion Medicine Specialist', 'Bone Marrow Specialist'] },
    ],
  },
  {
    category: 'Gastroenterology & Abdominal Sciences',
    departments: [
      { name: 'Gastroenterology', specialties: ['Gastroenterologist', 'Hepatologist', 'GI Surgeon'] },
      { name: 'Nephrology', specialties: ['Nephrologist', 'Renal Transplant Specialist'] },
      { name: 'Urology', specialties: ['Urologist', 'Andrologist', 'Uro-Oncologist'] },
      { name: 'Endocrinology', specialties: ['Endocrinologist', 'Diabetologist', 'Thyroid Specialist'] },
    ],
  },
  {
    category: 'Surgical & Specialty Medicine',
    departments: [
      { name: 'General Surgery', specialties: ['General Surgeon', 'Laparoscopic Surgeon', 'Bariatric Surgeon'] },
      { name: 'Plastic & Reconstructive Surgery', specialties: ['Plastic Surgeon', 'Cosmetic Surgeon', 'Reconstructive Surgeon'] },
      { name: 'Dermatology', specialties: ['Dermatologist', 'Cosmetic Dermatologist', 'Dermatologic Surgeon'] },
      { name: 'Gynecology & Obstetrics', specialties: ['Gynecologist', 'Obstetrician', 'Fertility Specialist (IVF)', 'Maternal-Fetal Specialist'] },
    ],
  },
  {
    category: 'Head, Neck & Sensory Organs',
    departments: [
      { name: 'Ophthalmology', specialties: ['Ophthalmologist', 'Retina Specialist', 'Cornea Specialist', 'Glaucoma Specialist'] },
      { name: 'ENT (Otorhinolaryngology)', specialties: ['ENT Specialist', 'Otologist', 'Rhinologist', 'Laryngologist'] },
      { name: 'Dentistry', specialties: ['General Dentist', 'Orthodontist', 'Endodontist', 'Periodontist', 'Oral & Maxillofacial Surgeon'] },
    ],
  },
  {
    category: 'Emergency & Critical Care',
    departments: [
      { name: 'Emergency Medicine', specialties: ['Emergency Physician', 'Trauma Specialist'] },
      { name: 'Critical Care Medicine', specialties: ['Intensivist', 'ICU Care Specialist'] },
      { name: 'Anesthesiology', specialties: ['Anesthesiologist', 'Pain Medicine Specialist'] },
    ],
  },
];

// Helper to generate 30+ realistic doctors per department
const generateDoctorsForDept = (
  deptName: string,
  prefix: string,
  baseFee: number,
  doctorSeeds: Array<{ name: string; qual: string; spec: string; sub: string; room: string }>,
  targetCount: number = 30
): DoctorProfile[] => {
  const doctors: DoctorProfile[] = [];
  const defaultSlotsPool = [
    ['08:30 AM', '10:00 AM', '11:30 AM', '02:00 PM', '04:15 PM', '05:45 PM', '07:15 PM'],
    ['09:00 AM', '10:30 AM', '11:45 AM', '02:15 PM', '04:00 PM', '05:30 PM', '07:00 PM'],
    ['08:00 AM', '09:45 AM', '11:15 AM', '01:30 PM', '03:30 PM', '05:00 PM', '06:30 PM'],
    ['09:15 AM', '10:45 AM', '12:15 PM', '02:45 PM', '04:30 PM', '06:00 PM', '07:30 PM'],
  ];

  // Seeded items
  doctorSeeds.forEach((seed, i) => {
    const initials = seed.name.replace('Dr. ', '').split(' ').map((n) => n[0]).join('').substring(0, 2);
    doctors.push({
      id: `${prefix}-${i + 1}`,
      name: seed.name,
      qualification: seed.qual,
      specialty: seed.spec,
      subSpecialty: seed.sub,
      department: deptName,
      rating: parseFloat((4.6 + (i % 5) * 0.08).toFixed(1)),
      reviews: 120 + i * 35,
      experience: `${10 + (i % 15)} Years Exp.`,
      fee: `₹${baseFee + (i % 4) * 200}`,
      nextSlot: defaultSlotsPool[i % 4][0],
      availableSlots: defaultSlotsPool[i % 4],
      hospitalUnit: seed.room,
      avatar: initials,
    });
  });

  // Unique Indian Name Pools
  const indianFirstNames = [
    'Anup', 'Devendra', 'Jayant', 'Ramesh', 'Alok', 'Sunita', 'Deepak', 'Suresh', 'Arvind', 'Sanjay',
    'Kavita', 'Siddharth', 'Bhavna', 'Gaurav', 'Shweta', 'Manish', 'Meera', 'Nitin', 'Divya', 'Tarun',
    'Pooja', 'Amit', 'Neha', 'Rajesh', 'Vikram', 'Priya', 'Ananya', 'Rohan', 'Swati', 'Alka',
    'Rajiv', 'Kiran', 'Preeti', 'Manoj', 'Aarti', 'Vijay', 'Shilpa', 'Rahul', 'Anjali', 'Sameer',
    'Poonam', 'Sunil', 'Rekha', 'Ashok', 'Girish', 'Latika', 'Mahesh', 'Nisha', 'Pradeep', 'Sarika'
  ];

  const indianLastNames = [
    'Singh', 'Roy', 'Mukherjee', 'Chandra', 'Verma', 'Rao', 'Reddy', 'Menon', 'Sharma', 'Deshmukh',
    'Nambiar', 'Joshi', 'Sen', 'Banerjee', 'Kapoor', 'Chatterjee', 'Iyer', 'Agarwal', 'Chawla', 'Gupta',
    'Bhatia', 'Kulkarni', 'Saxena', 'Patel', 'Malhotra', 'Bose', 'Dutta', 'Choudhury', 'Pandey', 'Mishra',
    'Trivedi', 'Shukla', 'Chakraborty', 'Narang', 'Thakur', 'Vaidya', 'Kashyap', 'Chauhan'
  ];

  let count = doctors.length;
  const deptHash = Math.abs(deptName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));

  while (count < targetCount) {
    const fIdx = (deptHash + count) % indianFirstNames.length;
    const lIdx = (deptHash * 7 + count * 3) % indianLastNames.length;
    const fName = indianFirstNames[fIdx];
    const lName = indianLastNames[lIdx];
    const name = `Dr. ${fName} ${lName}`;
    const initials = `${fName[0]}${lName[0]}`;

    // Qualification based on department type
    let qual = 'MD, DM, FACC';
    if (deptName.toLowerCase().includes('surgery') || deptName.toLowerCase().includes('ortho')) {
      qual = count % 2 === 0 ? 'MS, MCh, FRCS' : 'MS, DNB (Surgery)';
    } else if (deptName.toLowerCase().includes('pediatric')) {
      qual = count % 2 === 0 ? 'MD (Pediatrics), DCH' : 'MD, DNB (Pediatrics)';
    } else if (deptName.toLowerCase().includes('dent')) {
      qual = count % 2 === 0 ? 'MDS, BDS' : 'BDS, FICCDE';
    } else if (deptName.toLowerCase().includes('psych')) {
      qual = count % 2 === 0 ? 'MD (Psychiatry), DPM' : 'M.Phil (Clinical Psych)';
    } else {
      qual = count % 2 === 0 ? 'MD, DM, FACP' : 'MD, DNB, FCCP';
    }

    const spec = `${deptName} Specialist`;
    const sub = `Advanced ${deptName} Clinical Care`;
    const room = `Suite ${100 + count} OPD Wing`;
    const slots = defaultSlotsPool[count % 4];

    doctors.push({
      id: `${prefix}-${count + 1}`,
      name,
      qualification: qual,
      specialty: spec,
      subSpecialty: sub,
      department: deptName,
      rating: parseFloat((4.6 + (count % 4) * 0.1).toFixed(1)),
      reviews: 95 + count * 22,
      experience: `${8 + (count % 16)} Years Exp.`,
      fee: `₹${baseFee + (count % 5) * 150}`,
      nextSlot: slots[0],
      availableSlots: slots,
      hospitalUnit: room,
      avatar: initials,
    });
    count++;
  }

  return doctors;
};

// Seeded specific doctors map for key departments
const SEEDED_DOCTORS_MAP: Record<string, Array<{ name: string; qual: string; spec: string; sub: string; room: string }>> = {
  'Cardiology': [
    { name: 'Dr. Anup Singh', qual: 'MD, DM (Cardiology), FACC', spec: 'Interventional Cardiology', sub: 'Coronary Stenting & Heart Care', room: 'Cardiology Wing Suite 101' },
    { name: 'Dr. Devendra Roy', qual: 'MD, DM (Cardiology), FACC', spec: 'Diagnostic Cardiology', sub: 'Complex Cardiac Conditions', room: 'Main Cardiac Tower Suite 401' },
    { name: 'Dr. Jayant Mukherjee', qual: 'MD, DM (Cardiology), FSCAI', spec: 'Electrophysiology', sub: 'Pacemaker & Arrhythmia Care', room: 'Cardiac Suite 402' },
    { name: 'Dr. Ramesh Chandra', qual: 'MD, FACC, FESC', spec: 'Clinical Cardiology', sub: 'Heart Failure Management', room: 'Heart Center Suite 102' },
    { name: 'Dr. Alok Verma', qual: 'MD, MCh (Cardiothoracic)', spec: 'Cardiac Surgery', sub: 'CABG Bypass & Valve Repair', room: 'Surgical ICU Block B' },
    { name: 'Dr. Sunita Rao', qual: 'MD (Internal Med), FESC', spec: 'Non-Invasive Cardiology', sub: 'Echocardiogram 3D Imaging', room: 'Cardiology OPD 3' },
    { name: 'Dr. Deepak Reddy', qual: 'MD, DM (Pediatric Cardiology)', spec: 'Pediatric Cardiology', sub: 'Congenital Heart Defects', room: 'Pediatric Cardiac Wing' },
    { name: 'Dr. Suresh Menon', qual: 'MD (Cardiology), DNB', spec: 'General Cardiology', sub: 'Hypertension & Lipid Control', room: 'Outpatient Clinic A' },
  ],
  'General Medicine': [
    { name: 'Dr. Arvind Sharma', qual: 'MD (Internal Medicine), FACP', spec: 'General Physician', sub: 'Chronic Disease Management', room: 'Internal Med OPD 101' },
    { name: 'Dr. Sanjay Deshmukh', qual: 'MD (General Medicine), DNB', spec: 'Family Medicine', sub: 'Diabetes & Metabolism', room: 'Primary Care Suite 5' },
    { name: 'Dr. Kavita Nambiar', qual: 'MD, PhD (Internal Med)', spec: 'Internal Medicine', sub: 'Geriatric Primary Care', room: 'General OPD 104' },
  ],
  'Neurology': [
    { name: 'Dr. Siddharth Joshi', qual: 'MD, PhD, FRCS (Neurosurgery)', spec: 'Neurosurgery', sub: 'Brain Tumor & Spine Surgery', room: 'Neurology Tower Suite 601' },
    { name: 'Dr. Bhavna Sen', qual: 'MD, DM (Neurology)', spec: 'Cognitive Neurology', sub: 'Memory & Dementia Care', room: 'Neuro Science Center' },
    { name: 'Dr. Gaurav Banerjee', qual: 'MD (Neurology), DNB', spec: 'Neuromuscular Medicine', sub: 'ALS & Neuropathy', room: 'Neuro OPD 2' },
  ],
  'Orthopedics': [
    { name: 'Dr. Shweta Kapoor', qual: 'MS (Orthopedics), FRCS', spec: 'Joint Replacement', sub: 'Robotic Knee & Hip Arthroplasty', room: 'Ortho Trauma Center' },
    { name: 'Dr. Manish Chatterjee', qual: 'MD, MS (Ortho), FACS', spec: 'Spine Surgery', sub: 'Minimally Invasive Spine Surgery', room: 'Spine Care Clinic 3' },
  ],
  'Pediatrics': [
    { name: 'Dr. Meera Iyer', qual: 'MD (Pediatrics), FAAP', spec: 'Pediatric Medicine', sub: 'Pediatric Surgery & Infant Care', room: 'Children Health Tower' },
    { name: 'Dr. Nitin Agarwal', qual: 'MD (Pediatric Surgery)', spec: 'Pediatric Surgery', sub: 'Neonatal Reconstructive Surgery', room: 'NICU Block C' },
  ],
  'Dermatology': [
    { name: 'Dr. Divya Chawla', qual: 'MD (Dermatology), DNB', spec: 'Cosmetic Dermatology', sub: 'Laser Surgery & Skin Care', room: 'Skin Center Suite 301' },
  ],
  'Oncology': [
    { name: 'Dr. Tarun Gupta', qual: 'MD, DM (Oncology)', spec: 'Surgical Oncology', sub: 'Tumor Resection & Chemo', room: 'Oncology Tower Suite 501' },
  ],
  'Gynecology & Obstetrics': [
    { name: 'Dr. Pooja Bhatia', qual: 'MD (Gynecology & Obstetrics), FACOG', spec: 'Gynecology & IVF', sub: 'Maternal-Fetal Medicine & High Risk Pregnancy', room: 'Women Health Center Suite 201' },
  ],
  'ENT (Otorhinolaryngology)': [
    { name: 'Dr. Amit Kulkarni', qual: 'MS (ENT), DNB', spec: 'Otorhinolaryngology', sub: 'Endoscopic Sinus & Micro Ear Surgery', room: 'ENT Clinic Suite 105' },
  ],
  'Ophthalmology': [
    { name: 'Dr. Neha Saxena', qual: 'MS (Ophthalmology), FRCS', spec: 'Ophthalmology', sub: 'Lasik & Cataract Microsurgery', room: 'Eye Care Institute Suite 102' },
  ],
  'Gastroenterology': [
    { name: 'Dr. Rajesh Patel', qual: 'MD, DM (Gastroenterology)', spec: 'Gastroenterology', sub: 'Endoscopy & Hepatology', room: 'Gastro Suite 304' },
  ],
  'Psychiatry': [
    { name: 'Dr. Arvind Sharma', qual: 'MD (Psychiatry), DPM', spec: 'Clinical Psychiatry', sub: 'Neuro-Psychiatry & Behavioral Health', room: 'Mental Health Pavilion' },
  ],
  'Urology': [
    { name: 'Dr. Vikram Malhotra', qual: 'MS (Urology), MCh', spec: 'Urology', sub: 'Kidney Stones & Endourology', room: 'Urology Center Suite 405' },
  ],
  'Nephrology': [
    { name: 'Dr. Priya Sharma', qual: 'MD, DM (Nephrology)', spec: 'Nephrology', sub: 'Dialysis & Renal Care', room: 'Kidney Care Unit 202' },
  ],
  'Pulmonology': [
    { name: 'Dr. Anup Singh', qual: 'MD (Pulmonology), FCCP', spec: 'Pulmonology', sub: 'Asthma, COPD & Sleep Apnea', room: 'Chest Clinic Suite 303' },
  ],
  'Emergency Medicine': [
    { name: 'Dr. Sunita Rao', qual: 'MD (Emergency Medicine), Dip. Trauma', spec: 'Emergency Trauma', sub: 'Critical Trauma & Acute Care', room: 'Emergency ER Trauma Room 1' },
  ],
};

// Automatically generate realistic Indian doctors with varied counts per department (e.g. 28, 27, 29, 21, 31, 25)
export const REAL_DOCTORS_DATASET: DoctorProfile[] = (() => {
  const allDoctors: DoctorProfile[] = [];
  const deptSet = new Set<string>();

  MEDICAL_DEPARTMENTS_CATALOG.forEach((cat) => {
    cat.departments.forEach((d) => deptSet.add(d.name));
  });

  const allDepts = Array.from(deptSet);

  // Varied count pool per department for realistic hospital sizing
  const variedCountsPool = [28, 27, 29, 21, 31, 25, 26, 24, 30, 23, 28, 27, 32, 22, 29, 26, 28, 25, 27, 30, 24, 21, 29, 26, 28, 31, 27, 25, 23, 29, 26, 28];

  allDepts.forEach((dept, idx) => {
    const prefix = dept.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 4);
    const seeds = SEEDED_DOCTORS_MAP[dept] || [];
    const baseFee = 700 + (idx % 12) * 100;
    const targetCount = variedCountsPool[idx % variedCountsPool.length];
    const docs = generateDoctorsForDept(dept, prefix, baseFee, seeds, targetCount);
    allDoctors.push(...docs);
  });

  return allDoctors;
})();
