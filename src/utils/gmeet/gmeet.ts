import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../api/api.ts";
import {handleApiError} from "../errorHandler.ts";
import {GoogleSignin} from "@react-native-google-signin/google-signin";
import {postWall} from "../../api/modules/wallApi.ts";

const getFreshAccessToken = async () => {
    try {
        const tokens = await GoogleSignin.getTokens();
        return tokens.accessToken;
    } catch (err) {
        console.error('🔒 Failed to get access token:', err.message);
        handleApiError(err, "Dfdf")
        throw err;
    }
};

export const createGoogleMeet = async ({
                                           title = 'SNSU Class Meeting',
                                           ClassID,
                                           isScheduled = false,
                                           dateTime = null,
                                           attendees = [],
                                       }) => {
    try {
        const accessToken = await getFreshAccessToken();
        if (!accessToken) throw new Error('No access token available');

        const startTime = isScheduled && dateTime ? new Date(dateTime) : new Date(Date.now() + 5 * 60 * 1000);
        const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

        const event = {
            summary: title,
            start: {
                dateTime: startTime.toISOString(),
                timeZone: 'Asia/Manila',
            },
            end: {
                dateTime: endTime.toISOString(),
                timeZone: 'Asia/Manila',
            },
            attendees: attendees.map(email => ({ email })),
            conferenceData: {
                createRequest: {
                    requestId: 'snsu-meet-' + new Date().getTime(),
                    conferenceSolutionKey: { type: 'hangoutsMeet' },
                },
            },
        };

        const res = await api.post(
            'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
            event,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        return res.data.hangoutLink;
    } catch (error) {
        console.error('Failed to create Google Meet:', error.message);
        throw error;
    }
};
