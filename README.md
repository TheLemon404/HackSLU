# Howami AI

## Background

This was our teams entry for the firsts every HackSLU hackathon. The theme was healthcare and we specialized in the track of telehealth and mental health.

## Goal

Oftentimes it can take weeks or months to get into a therapists office, and much of the first visit 
is centered around the psychiatrist asking a series of standardized questions to rank the 
severity of the patient's condition, if there is any. Due to the sheer number of people utilizing 
therapy, this initial visit contributes to a large backlog of patients. Our project was designed to
help midigate this backlog by determining the severity of the patients conditions before the appointment,
and to provide resources on where to seek help, should they need it.

> [!IMPORTANT]
> Context

For most of our team, this was their first hackathon and first real experience programming outside of class.
Because of this, we descided to keep our scope small. We descided to create a custom sentiment analysis model
to analize the patients first chat, and from there descided which of the psychiatric standardized questionairs to
present to the patient. To make the experienced more personalized, we used Google Gemeni to tailor the questions 
asked in a way that feels conversational and natural. After the patient has completed the questionair, we then 
use simple prompt engineering to get a general score of the patients wellbeing, possible courses of action, and resources
near the patient.

> [!NOTE]
> Improvements

Currently we rely on gemeni for the final assessment and scoring, simply due to the 24 hour time constraint and limited
team experience. Ideally this would use a custom model, hosted with our existing models API.

# Showcase
![Screenshot 2025-07-02 113012](https://github.com/user-attachments/assets/e31d8bee-cb54-436d-97c4-d99f0a10b710)
![Screenshot 2025-07-02 113602](https://github.com/user-attachments/assets/69d49f12-8e01-45bc-9061-b0dac9b115f4)
![Screenshot 2025-07-02 113633](https://github.com/user-attachments/assets/e5dce214-5119-4f8c-8b4a-8f67b8d83101)
