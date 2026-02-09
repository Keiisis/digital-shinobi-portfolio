-- Add missing translation keys for Kevin Assistant voice functionality
-- Run this in your Supabase SQL editor

-- French translations (base)
INSERT INTO translations (locale, key, value) VALUES
('fr', 'assistant.error.mic_permission', 'Permission micro refusée. Veuillez autoriser l''accès au microphone.'),
('fr', 'assistant.error.no_voice', 'La reconnaissance vocale n''est pas disponible sur ce navigateur.'),
('fr', 'assistant.error.generic', 'Désolé, une erreur s''est produite. Veuillez réessayer.'),
('fr', 'assistant.muted', 'Micro coupé'),
('fr', 'portfolio.click_expand', 'Cliquer pour agrandir'),
('fr', 'portfolio.swipe_hint', 'Glisser pour naviguer')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- English translations
INSERT INTO translations (locale, key, value) VALUES
('en', 'assistant.error.mic_permission', 'Microphone permission denied. Please allow microphone access.'),
('en', 'assistant.error.no_voice', 'Voice recognition is not available on this browser.'),
('en', 'assistant.error.generic', 'Sorry, an error occurred. Please try again.'),
('en', 'assistant.muted', 'Mic muted'),
('en', 'portfolio.click_expand', 'Click to expand'),
('en', 'portfolio.swipe_hint', 'Swipe to navigate')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- Spanish translations
INSERT INTO translations (locale, key, value) VALUES
('es', 'assistant.error.mic_permission', 'Permiso de micrófono denegado. Por favor, permita el acceso al micrófono.'),
('es', 'assistant.error.no_voice', 'El reconocimiento de voz no está disponible en este navegador.'),
('es', 'assistant.error.generic', 'Lo siento, ocurrió un error. Por favor, inténtelo de nuevo.'),
('es', 'assistant.muted', 'Micrófono silenciado'),
('es', 'portfolio.click_expand', 'Clic para ampliar'),
('es', 'portfolio.swipe_hint', 'Deslice para navegar')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- German translations
INSERT INTO translations (locale, key, value) VALUES
('de', 'assistant.error.mic_permission', 'Mikrofonberechtigung verweigert. Bitte erlauben Sie den Mikrofonzugriff.'),
('de', 'assistant.error.no_voice', 'Spracherkennung ist in diesem Browser nicht verfügbar.'),
('de', 'assistant.error.generic', 'Entschuldigung, ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.'),
('de', 'assistant.muted', 'Mikrofon stumm'),
('de', 'portfolio.click_expand', 'Klicken zum Vergrößern'),
('de', 'portfolio.swipe_hint', 'Wischen zum Navigieren')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- Italian translations
INSERT INTO translations (locale, key, value) VALUES
('it', 'assistant.error.mic_permission', 'Permesso microfono negato. Si prega di consentire l''accesso al microfono.'),
('it', 'assistant.error.no_voice', 'Il riconoscimento vocale non è disponibile su questo browser.'),
('it', 'assistant.error.generic', 'Spiacente, si è verificato un errore. Si prega di riprovare.'),
('it', 'assistant.muted', 'Microfono disattivato'),
('it', 'portfolio.click_expand', 'Clicca per ingrandire'),
('it', 'portfolio.swipe_hint', 'Scorri per navigare')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- Portuguese translations
INSERT INTO translations (locale, key, value) VALUES
('pt', 'assistant.error.mic_permission', 'Permissão de microfone negada. Por favor, permita o acesso ao microfone.'),
('pt', 'assistant.error.no_voice', 'O reconhecimento de voz não está disponível neste navegador.'),
('pt', 'assistant.error.generic', 'Desculpe, ocorreu um erro. Por favor, tente novamente.'),
('pt', 'assistant.muted', 'Microfone silenciado'),
('pt', 'portfolio.click_expand', 'Clique para ampliar'),
('pt', 'portfolio.swipe_hint', 'Deslize para navegar')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;
