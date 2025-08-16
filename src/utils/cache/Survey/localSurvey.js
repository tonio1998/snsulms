import AsyncStorage from '@react-native-async-storage/async-storage';
import {handleApiError} from "../../errorHandler";
import NetInfo from "@react-native-community/netinfo";
const getCacheKeys = (UserID) => ({
    CACHE_KEY: `local_survey_cache_${UserID}`,
    CACHE_DATE_KEY: `local_survey_date_cache_${UserID}`,
});

export const saveSurveyToLocal = async (UserID, data) => {
    if (!UserID) return null;
    const { CACHE_KEY, CACHE_DATE_KEY } = getCacheKeys(UserID);

    try {
        const now = new Date();
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
        await AsyncStorage.setItem(CACHE_DATE_KEY, now.toISOString());
        return now;
    } catch (err) {
        console.error('Error saving classes:', err);
        return null;
    }
};

export const loadSurveyToLocal = async (UserID) => {
    if (!UserID) return { data: null, date: null };
    const { CACHE_KEY, CACHE_DATE_KEY } = getCacheKeys(UserID);

    try {
        const dataStr = await AsyncStorage.getItem(CACHE_KEY);
        const dateStr = await AsyncStorage.getItem(CACHE_DATE_KEY);

        return {
            data: dataStr ? JSON.parse(dataStr) : null,
            date: dateStr ? new Date(dateStr) : null,
        };
    } catch (err) {
        console.error('Error loading classes:', err);
        handleApiError(err, 'Load activity from cache');
        return { data: null, date: null };
    }
};

export const fetchSurveyData = async (UserID, surveyId) => {
    if (!UserID || !surveyId) {
        console.warn("Missing UserID or surveyId");
        return null;
    }

    const { CACHE_KEY, CACHE_DATE_KEY } = getCacheKeys(UserID);

    try {
        const dataStr = await AsyncStorage.getItem(CACHE_KEY);
        const dateStr = await AsyncStorage.getItem(CACHE_DATE_KEY);
        if (dataStr) {
            const cachedData = JSON.parse(dataStr);
            const found = cachedData.find?.(
                (survey) => survey.id === surveyId
            );

            if (found) {
                // return { ...found, source: "cache" };
                return { ...found, date: dateStr };
            }
        }
    } catch (err) {
        console.error("Error fetching survey data:", err);
        handleApiError(err, "Fetch survey data");
        return null;
    }
};

export const localupdateSurveyDate = async (UserId, SurveyId, SurveyDate) => {
    if (!UserId || !SurveyId) {
        console.warn("Missing UserId or SurveyId");
        return null;
    }

    const { CACHE_KEY, CACHE_DATE_KEY } = getCacheKeys(UserId);

    try {
        const dataStr = await AsyncStorage.getItem(CACHE_KEY);
        let surveys = dataStr ? JSON.parse(dataStr) : [];

        if (!Array.isArray(surveys)) {
            surveys = [surveys];
        }

        const index = surveys.findIndex((s) => s.id === SurveyId);
        if (index !== -1) {
            surveys[index].date = SurveyDate;
        } else {
            surveys.push({
                id: SurveyId,
                date: SurveyDate,
            });
        }

        const now = new Date();
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(surveys));
        await AsyncStorage.setItem(CACHE_DATE_KEY, now.toISOString());

        return {
            data: surveys,
            date: now,
        };
    } catch (err) {
        console.error("Error updating survey date:", err);
        handleApiError(err, "Update survey date");
        return null;
    }
};

export const saveQuestionToLocal = async (UserId, SurveyId, SectionId, question) => {
    if (!UserId || !SurveyId || !SectionId) {
        console.warn("Missing UserId, SurveyId or SectionId");
        return null;
    }

    const { CACHE_KEY, CACHE_DATE_KEY } = getCacheKeys(UserId);

    try {
        const dataStr = await AsyncStorage.getItem(CACHE_KEY);
        let surveys = dataStr ? JSON.parse(dataStr) : [];

        if (!Array.isArray(surveys)) {
            surveys = [surveys];
        }

        // 🔹 Find survey
        let surveyIndex = surveys.findIndex((s) => s.id === SurveyId);
        if (surveyIndex === -1) {
            surveys.push({
                id: SurveyId,
                date: new Date().toISOString(),
                sections: []
            });
            surveyIndex = surveys.length - 1;
        }

        const survey = surveys[surveyIndex];
        survey.sections = survey.sections || [];

        // 🔹 Find section
        let sectionIndex = survey.sections.findIndex(sec => sec.id === SectionId);
        if (sectionIndex === -1) {
            survey.sections.push({
                id: SectionId,
                questions: []
            });
            sectionIndex = survey.sections.length - 1;
        }

        const section = survey.sections[sectionIndex];
        section.questions = section.questions || [];

        // 🔹 Handle question
        let qIndex = -1;
        if (question?.id) {
            // Only check for duplicates if id exists
            qIndex = section.questions.findIndex(q => q.id === question.id);
        }

        if (qIndex !== -1) {
            // Update existing
            section.questions[qIndex] = {
                ...section.questions[qIndex],
                ...question,
                updatedAt: new Date().toISOString()
            };
        } else {
            // Always append if no id OR no match
            section.questions.push({
                ...question,
                updatedAt: new Date().toISOString()
            });
        }

        // 🔹 Save back
        const now = new Date();
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(surveys));
        await AsyncStorage.setItem(CACHE_DATE_KEY, now.toISOString());

        return { data: surveys, date: now };
    } catch (err) {
        console.error("Error saving question locally:", err);
        handleApiError(err, "Save question locally");
        return null;
    }
};

export const syncSurveysToServer = async (UserId, addQuestion) => {
    const { data } = await loadSurveyToLocal(UserId);
    if (!data) return;

    try {
        for (const survey of data) {
            if (survey.questions && survey.questions.length > 0) {
                for (const question of survey.questions) {
                    if (question.synced) continue;

                    await addQuestion(question.SectionID, question);
                    question.synced = true;
                }
            }
        }

        const { CACHE_KEY } = getCacheKeys(UserId);
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));

        console.log("✅ All questions synced successfully!");
    } catch (err) {
        console.error("❌ Error syncing surveys:", err);
    }
};
