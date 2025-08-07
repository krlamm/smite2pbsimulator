import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();
const rtdb = admin.database();

// Function to update Firestore draft based on Realtime Database status changes
export const onUserStatusChanged = functions.database.ref('/status/{uid}').onUpdate(
    async (change, context) => {
        const eventStatus = change.after.val();
        const uid = context.params.uid;
        const draftId = eventStatus.draftId;

        if (!draftId) {
            functions.logger.log(`No draftId for user ${uid}`);
            return;
        }

        const draftRef = db.doc(`drafts/${draftId}`);

        const status = eventStatus.state === 'online' ? 'online' : 'offline';

        try {
            await draftRef.update({
                [`participants.${uid}.status`]: status,
            });
            functions.logger.log(`Updated status for user ${uid} in draft ${draftId} to ${status}`);
        } catch (error) {
            functions.logger.error(`Failed to update status for user ${uid} in draft ${draftId}`, error);
        }
    });

// Function to manage draft lifecycle based on participant statuses
export const onDraftUpdated = functions.firestore.document('drafts/{draftId}').onUpdate(
    async (change, context) => {
        const draft = change.after.data();
        const draftId = context.params.draftId;

        if (!draft.participants) {
            return;
        }

        const participants = Object.values(draft.participants) as { status: string }[];
        const isAnyoneOnline = participants.some(p => p.status === 'online' || p.status === 'viewingFinalTeams');

        const draftRef = db.doc(`drafts/${draftId}`);

        if (isAnyoneOnline) {
            // If someone is online, ensure the draft doesn't expire
            if (draft.expiresAt) {
                try {
                    await draftRef.update({ expiresAt: null });
                    functions.logger.log(`Draft ${draftId} is active, removed expiration.`);
                } catch (error) {
                    functions.logger.error(`Failed to remove expiration for draft ${draftId}`, error);
                }
            }
        } else {
            // If everyone is offline, set the draft to expire in 5 minutes
            const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
            try {
                await draftRef.update({ expiresAt: fiveMinutesFromNow });
                functions.logger.log(`All users offline in draft ${draftId}, setting to expire.`);
            } catch (error) {
                functions.logger.error(`Failed to set expiration for draft ${draftId}`, error);
            }
        }
    });

// Function to set initial expiration on draft creation
export const onDraftCreated = functions.firestore.document('drafts/{draftId}').onCreate(
    async (snap, context) => {
        const draftId = context.params.draftId;
        const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);

        try {
            await snap.ref.update({ expiresAt: oneHourFromNow });
            functions.logger.log(`Set initial 1-hour expiration for new draft ${draftId}`);
        } catch (error) {
            functions.logger.error(`Failed to set initial expiration for draft ${draftId}`, error);
        }
    });
