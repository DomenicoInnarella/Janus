import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Report, ReportReason, ReportStatus } from '../types';

const REPORTS_COLLECTION = 'reports';
const PARKING_COLLECTION = 'parkingSpots';

export const reportService = {
  // Submit fraud / safety report for a parking spot
  async submitReport(
    parkingId: string,
    parkingTitle: string,
    reporterId: string,
    reporterEmail: string | undefined,
    reason: ReportReason,
    description: string
  ): Promise<Report> {
    const reportId = `rep-${Date.now()}`;

    const newReport: Report = {
      id: reportId,
      parkingId,
      parkingTitle,
      reporterId,
      reporterEmail,
      reason,
      description,
      status: 'pending_review',
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, REPORTS_COLLECTION, reportId), newReport);

      // Auto-moderation check: if reason is severe, mark parking spot as pending_review
      if (['does_not_exist', 'fake_photos', 'host_not_owner', 'suspicious_activity'].includes(reason)) {
        try {
          await updateDoc(doc(db, PARKING_COLLECTION, parkingId), {
            status: 'pending_review',
            updatedAt: new Date().toISOString(),
          });
        } catch (e) {
          console.warn('Could not auto-flag spot status:', e);
        }
      }

      return newReport;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${REPORTS_COLLECTION}/${reportId}`);
    }
  },

  // Get user's submitted reports
  async getUserReports(reporterId: string): Promise<Report[]> {
    try {
      const q = query(
        collection(db, REPORTS_COLLECTION),
        where('reporterId', '==', reporterId)
      );
      const snapshot = await getDocs(q);
      const list: Report[] = [];
      snapshot.forEach((d) => list.push(d.data() as Report));
      return list;
    } catch (error) {
      console.warn('Get reports error:', error);
      return [];
    }
  }
};
