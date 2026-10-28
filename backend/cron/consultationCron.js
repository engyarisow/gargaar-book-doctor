import cron from 'node-cron';
import consultationsModel from '../models/consultationsModel.js';

const getAppointmentTime = (item) => {
    if (item.appointmentAt) {
        const dt = new Date(item.appointmentAt);
        return isNaN(dt.getTime()) ? null : dt;
    }

    if (!item.slotDate || !item.slotTime) return null;

    const datePart =
        typeof item.slotDate === 'string'
            ? item.slotDate.slice(0, 10)
            : new Date(item.slotDate).toISOString().slice(0, 10);

    // Local Time
    const [year, month, day] = datePart.split('-');
    let hours = 0;
    let minutes = 0;

    const timeMatch = item.slotTime.match(/(\d+):(\d+)\s*(AM|PM|am|pm)?/);
    if (timeMatch) {
        hours = parseInt(timeMatch[1], 10);
        minutes = parseInt(timeMatch[2], 10);
        const modifier = timeMatch[3];

        if (modifier) {
            if (modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
            if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;
        }
    }

    const dt = new Date(year, month - 1, day, hours, minutes, 0);
    return isNaN(dt.getTime()) ? null : dt;
};

let isCronRunning = false;

const ConsultationCron = () => {
    cron.schedule('* * * * *', async () => {
        if (isCronRunning) return;
        isCronRunning = true;

        try {
            const now = new Date(); // Local Time-ka Server-ka

            const activeConsultations = await consultationsModel.find({
                isCompleted: false,
                cancelled: false,
                status: { $nin: ['completed', 'cancelled'] }
            });

            if (!activeConsultations.length) return;

            for (const item of activeConsultations) {
                try {
                    item.videoSession = item.videoSession || {};

                    const appointmentTime = getAppointmentTime(item);
                    if (!appointmentTime) continue;

                    const minutesSinceAppointment = Math.floor(
                        (now - appointmentTime) / (1000 * 60)
                    );

                    // Waqtiga ballanta wali lama gaarin
                    if (minutesSinceAppointment < 0) continue;

                    const doctorJoinedAt = item.videoSession.doctorJoinedAt
                        ? new Date(item.videoSession.doctorJoinedAt)
                        : null;

                    const patientJoinedAt = item.videoSession.patientJoinedAt
                        ? new Date(item.videoSession.patientJoinedAt)
                        : null;

                    const drJoined = !!doctorJoinedAt;
                    const ptJoined = !!patientJoinedAt;

                    let hasChanged = false;

                    // ==========================================
                    // 1. BALLANTU WALI WAY SOCOTAA (U dhexeyso 0 - 29 mins)
                    // ==========================================
                    if (minutesSinceAppointment < 30) {
                        if (drJoined && ptJoined && item.status !== 'in-progress') {
                            const actualStart = item.videoSession.actualStart
                                ? new Date(item.videoSession.actualStart)
                                : new Date(Math.max(doctorJoinedAt.getTime(), patientJoinedAt.getTime()));

                            item.videoSession.actualStart = actualStart;
                            item.status = 'in-progress';
                            hasChanged = true;
                        }
                    } 
                    // ==========================================
                    // 2. BALLANTU WAA DHAMMAATAY (Waqtigii Slot-ka wuxuu gaaray 30 mins ama ka badan)
                    // ==========================================
                    else if (minutesSinceAppointment >= 30) {
                        
                        // Sharciyada iyo Caddaaladda (Reason Logic)
                        if (drJoined && ptJoined) {
                            item.isCompleted = true;
                            item.status = 'completed';
                            item.cancelReason = 'Session Successfully Ended';
                        } 
                        else if (drJoined && !ptJoined) {
                            // Dhaqtarku xaqiisii wuu helayaa maadaama bukaanku maqnaa
                            item.isCompleted = true; 
                            item.status = 'completed';
                            item.cancelReason = 'Patient Missed';
                        } 
                        else if (!drJoined && ptJoined) {
                            // Bukaanku xaqiisii (Refund) wuu helayaa maadaama dhaqtarku maqnaa
                            item.cancelled = true;
                            item.status = 'cancelled';
                            item.cancelReason = 'Doctor Missed';
                        } 
                        else if (!drJoined && !ptJoined) {
                            // Labaduba way maqnaayeen
                            item.cancelled = true;
                            item.status = 'cancelled';
                            item.cancelReason = 'No Show From Both';
                        }

                        // ==========================================
                        // 3. FURITAANKA CHAT-KA (7 DAYS SUPPORT)
                        // ==========================================
                        if (item.status === 'completed') {
                            item.isChatOpen = true; // Chat-ka ayaa furmaya
                            
                            // Waqtiga uu dhacayo chat-ku (7 maalmood kadib waqtiga hadda la joogo)
                            const chatExpiryDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                            item.chatValidUntil = chatExpiryDate;
                        }

                        item.videoSession.actualEnd = now;
                        hasChanged = true;
                    }

                    if (hasChanged) {
                        await item.save();
                        console.log(
                            `[CRON] Appointment ${item._id} finalized => Status: ${item.status} | Reason: ${item.cancelReason}`
                        );
                    }

                } catch (itemError) {
                    console.error(
                        `[CRON] Error processing appointment ${item._id}:`,
                        itemError.message
                    );
                }
            }
        } catch (error) {
            console.error('[CRON] Global Job Error:', error.message);
        } finally {
            isCronRunning = false;
        }
    });
};

export default ConsultationCron;