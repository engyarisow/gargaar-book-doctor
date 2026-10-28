import consultationsModel from '../models/Consultation.js';

// Helper function to parse appointment time
const getAppointmentTime = (item) => {
    if (!item.slotDate || !item.slotTime) return null;
    return new Date(`${item.slotDate} ${item.slotTime}`);
};

export const checkConsultationStatuses = async () => {
    try {
        const activeConsultations = await consultationsModel.find({
            isCompleted: false,
            cancelled: false,
            status: { $nin: ['completed', 'cancelled', 'follow-up'] }
        });

        for (const item of activeConsultations) {
            const appointmentTime = getAppointmentTime(item);
            if (!appointmentTime) continue;

            const now = new Date();
            const minutesSinceAppointment = Math.floor((now - appointmentTime) / (1000 * 60));

            // Weli lama gaarin waqtigii ballanta
            if (minutesSinceAppointment < 0) continue;

            const drJoined = !!item.videoSession?.doctorJoinedAt;
            const ptJoined = !!item.videoSession?.patientJoinedAt;
            let hasChanged = false;

            // 1. Session-ku wuu socdaa (0 - 29 min)
            if (minutesSinceAppointment < 30) {
                if (drJoined && ptJoined && item.status !== 'in-progress') {
                    item.status = 'in-progress';
                    item.videoSession.actualStart = item.videoSession.actualStart || now;
                    hasChanged = true;
                }
            } 
            // 2. Session-ku waa dhammaaday (30+ min)
            else {
                if (drJoined && ptJoined) {
                    item.isCompleted = true;
                    // Tani waxay kicinaysaa Hook-ga Chat-ka ee database-ka (7 days support)
                    item.cancelReason = 'Session Successfully Ended'; 
                } else if (drJoined && !ptJoined) {
                    item.isCompleted = true; 
                    item.status = 'completed';
                    item.cancelReason = 'Patient Missed';
                } else {
                    item.cancelled = true;
                    item.status = 'cancelled';
                    item.cancelReason = drJoined ? 'Patient Missed' : 'Doctor Missed';
                }
                item.videoSession.actualEnd = now;
                hasChanged = true;
            }

            if (hasChanged) {
                await item.save();
            }
        }
    } catch (error) {
        console.error("Error in Consultation Cron Job:", error);
    }
};