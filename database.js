// MessPay Student Portal - Data layer
// Use this file to read/write wallet balances, mess transactions, and student profiles.

export function getMockWalletState() {
  return {
    balance: 2450,
    todaySpend: 120,
    weekSpend: 720,
  };
}

/**
 * Load a student's profile from Firebase Realtime Database and map it into profile.html.
 *
 * Expected schema at /students/{studentId}:
 * {
 *   fullName: string,
 *   rollNumber: string,
 *   hostelRoom: string,
 *   email: string,
 *   phone?: string,
 *   fingerprintId?: string
 * }
 */
export async function loadUserProfile(studentId) {
  const nameEl = document.getElementById('profile-name');
  const rollHeaderEl = document.getElementById('profile-roll');
  const avatarEl = document.getElementById('profile-avatar');
  const rollEl = document.getElementById('info-roll');
  const roomEl = document.getElementById('info-room');
  const emailEl = document.getElementById('info-email');
  const phoneEl = document.getElementById('info-phone');
  const fingerprintIdEl = document.getElementById('fingerprint-id');
  const fingerprintStatusEl = document.getElementById('fingerprint-status');
  const fingerprintWarningEl = document.getElementById('fingerprint-warning');

  if (!studentId) {
    console.warn('loadUserProfile: no studentId provided');
    return;
  }

  // Fallback UI state while loading.
  if (nameEl) nameEl.textContent = 'Loading profile…';

  try {
    let studentData = null;

    // If Firebase Realtime Database is available (v8 style global SDK), use it.
    if (window.firebase && typeof window.firebase.database === 'function') {
      const db = window.firebase.database();
      const snapshot = await db.ref('students').child(studentId).get();
      if (snapshot.exists()) {
        studentData = snapshot.val();
      }
    }

    // If Firebase is not configured or student not found, fall back to mock data.
    if (!studentData) {
      console.warn('loadUserProfile: using mock profile data (configure Firebase to use real data).');
      studentData = {
        fullName: 'Demo Student',
        rollNumber: '22CS123',
        hostelRoom: 'A-212',
        email: 'demo.student@college.edu',
        phone: '+91-90000-00000',
        fingerprintId: 'FP-987654',
      };
    }

    const {
      fullName = 'Student',
      rollNumber = '—',
      hostelRoom = '—',
      email = '—',
      phone = '',
      fingerprintId,
    } = studentData;

    if (nameEl) nameEl.textContent = fullName;
    if (rollHeaderEl) rollHeaderEl.textContent = `Roll Number · ${rollNumber}`;
    if (avatarEl && fullName) {
      const initial = fullName.trim().charAt(0).toUpperCase() || 'S';
      avatarEl.textContent = initial;
    }

    if (rollEl) rollEl.textContent = rollNumber;
    if (roomEl) roomEl.textContent = hostelRoom;
    if (emailEl) emailEl.textContent = email;
    if (phoneEl) phoneEl.textContent = phone || 'Not provided';

    if (fingerprintIdEl) fingerprintIdEl.textContent = fingerprintId || '—';

    if (fingerprintId) {
      if (fingerprintStatusEl) {
        fingerprintStatusEl.classList.remove('text-amber-700');
        fingerprintStatusEl.classList.add('text-emerald-600');
        fingerprintStatusEl.innerHTML =
          '<i data-lucide="check-circle-2" class="w-4 h-4"></i><span>Verified</span>';
      }
      if (fingerprintWarningEl) {
        fingerprintWarningEl.classList.add('hidden');
      }
    } else {
      if (fingerprintStatusEl) {
        fingerprintStatusEl.classList.remove('text-emerald-600');
        fingerprintStatusEl.classList.add('text-amber-700');
        fingerprintStatusEl.innerHTML =
          '<i data-lucide="alert-triangle" class="w-4 h-4"></i><span>Biometric not registered</span>';
      }
      if (fingerprintWarningEl) {
        fingerprintWarningEl.classList.remove('hidden');
      }
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  } catch (error) {
    console.error('Failed to load user profile:', error);
  }
}

